import { sinon, expect, fetchMock } from "../test-helper"
import { SinonSpy } from "sinon"
import { SpraypaintBase, Model, Attr } from "../../src/index"
import { StorageBackend, InMemoryStorageBackend } from "../../src/credential-storage"

const authorResponse = {
  id: "1",
  type: "people",
  attributes: {
    name: "John"
  }
}
const stubFind = {
  data: authorResponse
}
const stubAll = {
  data: [authorResponse]
}

let ApplicationRecord: typeof SpraypaintBase
let Author: typeof SpraypaintBase

/*
 * This is annoying, but since mocha runs its `beforeEach` blocks from the outside in,
 * there are a couple tests we need to be able to reinstantiate the model classes from
 * scratch for.  This is because loading JWT from localStorage happens when the model
 * class is created. This means we need to create those classes AFTER the localStorage
 * stubbing has happened. In those tests we will re-run the model instantiation after
 * the stubbing.
 */
const buildModels = () => {
  @Model({
    baseUrl: "http://example.com",
    apiNamespace: "/api/v1/"
  })
  class Base extends SpraypaintBase {}
  ApplicationRecord = Base

  @Model({
    endpoint: "authors",
    jsonapiType: "people"
  })
  class A extends ApplicationRecord {
    @Attr nilly!: string
  }
  Author = A

  ApplicationRecord.credentialStorageBackend = new InMemoryStorageBackend()
}

describe("authorization headers", () => {
  beforeEach(buildModels)

  describe("when header is set on model class", () => {
    beforeEach(() => {
      ApplicationRecord.jwt = "myt0k3n"
    })

    it("is sent in request", async () => {
      fetchMock.mock(
        (url: string, opts: any) => {
          expect(opts.headers.Authorization).to.eq('Token token="myt0k3n"')
          return true
        },
        { status: 200, body: stubFind, sendAsJson: true }
      )

      await Author.find(1)
    })
  })

  describe("when header is set in a custom generateAuthHeader", () => {
    let originalHeaderFn: any
    beforeEach(() => {
      ApplicationRecord.jwt = "cu570m70k3n"
      originalHeaderFn = Author.generateAuthHeader
      Author.generateAuthHeader = token => {
        return `Bearer ${token}`
      }
    })

    afterEach(() => {
      Author.generateAuthHeader = originalHeaderFn
    })

    it("sends the custom Authorization token in the request's headers", async () => {
      fetchMock.mock(
        (url, opts: any) => {
          expect(opts.headers.Authorization).to.eq("Bearer cu570m70k3n")
          return true
        },
        { status: 200, body: stubFind, sendAsJson: true }
      )

      await Author.find(1)
    })
  })

  describe("when header is NOT returned in response", () => {
    beforeEach(() => {
      fetchMock.get("http://example.com/api/v1/authors", {
        data: [
          {
            id: "1",
            type: "people",
            attributes: {
              name: "John"
            }
          }
        ]
      })

      ApplicationRecord.jwt = "dont change me"
    })

    it("does not override the JWT", async () => {
      await Author.all()

      expect(ApplicationRecord.getJWT()).to.eq("dont change me")
    })
  })

  describe("when header is returned in response", () => {
    beforeEach(() => {
      fetchMock.mock({
        matcher: "*",
        response: {
          status: 200,
          body: { data: [] },
          headers: {
            "X-JWT": "somet0k3n"
          }
        }
      })
    })

    it("is used in subsequent requests", async () => {
      await Author.all()
      fetchMock.restore()

      fetchMock.mock(
        (url, opts: any) => {
          expect(opts.headers.Authorization).to.eq('Token token="somet0k3n"')
          return true
        },
        { status: 200, body: stubAll, sendAsJson: true }
      )

      expect(Author.getJWT()).to.eq("somet0k3n")
      expect(ApplicationRecord.getJWT()).to.eq("somet0k3n")
      await Author.all()
    })

    describe("local storage", () => {
      beforeEach(() => {
        // Clear out model classes sot that each test block must recreate them after doing
        // necessary stubbing. Otherwise we might hide errors by mistake. See above comment
        // on the buildModels() function for more complete explanation
        ;(<any>ApplicationRecord) = null
        ;(<any>Author) = null

        buildModels()
      })

      describe("when JWT is not in credentialStorage", () => {
        it("updates credentialStorage on server response", async () => {
          await Author.all()

          expect(ApplicationRecord.getJWT()).to.eq("somet0k3n")
        })

        it("uses the new jwt in subsequent requests", async () => {
          await Author.all()
          fetchMock.restore()

          fetchMock.mock(
            (url, opts: any) => {
              expect(opts.headers.Authorization).to.eq(
                'Token token="somet0k3n"'
              )
              return true
            },
            { status: 200, body: stubAll, sendAsJson: true }
          )
          expect(Author.getJWT()).to.eq("somet0k3n")
          expect(ApplicationRecord.getJWT()).to.eq("somet0k3n")

          await Author.all()
        })
      })

      describe("when JWT is already in credentialStorage", () => {
        beforeEach(() => {
          fetchMock.restore()

          ApplicationRecord.credentialStorage.setJWT("myt0k3n")
        })

        it("sends it in initial request", async () => {
          fetchMock.mock(
            (url: string, opts: any) => {
              expect(opts.headers.Authorization).to.eq(
                'Token token="myt0k3n"'
              )
              return true
            },
            { status: 200, body: stubFind, sendAsJson: true }
          )

          await Author.find(1)
        })

        describe("when JWT is update from outside the model classes", () => {
          it('uses the new token in requests', async () => {
            ApplicationRecord.credentialStorage.setJWT("newToken")
            fetchMock.mock(
              (url: string, opts: any) => {
                expect(opts.headers.Authorization).to.eq(
                  'Token token="newToken"'
                )
                return true
              },
              { status: 200, body: stubFind, sendAsJson: true }
            )

            await Author.find(1)
          })
        })
      })
    })
  })

  describe("a write request", () => {
    beforeEach(() => {
      fetchMock.mock({
        matcher: "*",
        response: {
          status: 200,
          body: { data: [] },
          headers: {
            "X-JWT": "somet0k3n"
          }
        }
      })
    })

    it("also refreshes the jwt", async () => {
      const author = new Author({ firstName: "foo" })
      await author.save()

      expect(ApplicationRecord.getJWT()).to.eq("somet0k3n")
    })
  })

  afterEach(() => {
    fetchMock.restore()
  })
})

after(() => {
  fetchMock.restore()
})
