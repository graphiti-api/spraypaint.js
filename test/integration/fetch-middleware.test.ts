import { expect, sinon, fetchMock } from "../test-helper"
import { Author, ApplicationRecord } from "../fixtures"
import {
  MiddlewareStack,
  BeforeFilter,
  AfterFilter
} from "../../src/middleware-stack"

const mock401 = () => {
  fetchMock.restore()

  fetchMock.mock({
    matcher: "*",
    response: {
      status: 401,
      body: {
        errors: [
          {
            code: "unauthenticated",
            status: "401",
            title: "Authentication Error",
            detail: "You must sign in to access this resource",
            meta: {}
          }
        ]
      }
    }
  })
}

const mock404 = () => {
  fetchMock.restore()

  fetchMock.mock({
    matcher: "*",
    response: {
      status: 404,
      body: {
        errors: [
          {
            code: "not_found",
            status: "404",
            title: "Resource Not Found",
            detail: "Couldn't find Resource with id = 1",
            meta: {}
          }
        ]
      }
    }
  })
}

const mockBadJSON = () => {
  fetchMock.restore()

  fetchMock.mock({
    matcher: "*",
    response: {
      status: 200,
      body: undefined
    }
  })
}

const mock500 = () => {
  fetchMock.restore()

  fetchMock.mock({
    matcher: "*",
    response: {
      status: 500,
      body: {
        errors: []
      }
    }
  })
}

const mockSuccess = () => {
  fetchMock.restore()

  fetchMock.mock({
    matcher: "*",
    response: {
      status: 200,
      body: {
        data: []
      }
    }
  })
}

let before = {} as any
let after = {} as any
describe("fetch middleware", () => {
  const ABORT_ERR = new Error("abort")
  const oldStack = ApplicationRecord.middlewareStack

  beforeEach(() => {
    mockSuccess()

    const middleware = new MiddlewareStack()

    middleware.beforeFilters.push((url, options) => {
      before = { url, options }

      // Author.first, or saving author with name 'abortme'
      // should abort
      let shouldAbort = false
      if (url.indexOf("page") > -1) {
        shouldAbort = true
      }
      if (options.body && (options.body as string).indexOf("abortme") > -1) {
        shouldAbort = true
      }

      if (shouldAbort) {
        throw ABORT_ERR
      }

      ;(options.headers as Headers)["CUSTOM-HEADER"] = "whatever"
    })

    middleware.afterFilters.push((response, json) => {
      after = { response, json }

      if (response.status === 401) {
        throw ABORT_ERR
      }
    })

    ApplicationRecord.middlewareStack = middleware
  })

  afterEach(() => {
    fetchMock.restore()
    ApplicationRecord.middlewareStack = oldStack
    before = {}
    after = {}
  })

  describe("reads", () => {
    describe("on successful response", () => {
      it("correctly resolves the promise", async () => {
        const { data } = await Author.all()

        expect(data).to.deep.eq([])
      })

      it("runs beforeEach hooks", () => {
        return Author.all().then(({ data }) => {
          expect(before.url).to.eq("http://example.com/api/v1/authors")
          expect(before.options).to.deep.eq({
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "CUSTOM-HEADER": "whatever"
            },
            method: "GET"
          })
        })
      })

      it("runs afterEach hooks", () => {
        return Author.all().then(({ data }) => {
          expect(after.response.status).to.eq(200)
        })
      })
    })

    describe("when beforeFetch middleware aborts", () => {
      beforeEach(() => {
        mockSuccess()
      })

      it("rejects the promise w/correct RequestError class", () => {
        return Author.first()
          .then(({ data }) => {
            expect("dont get here!").to.eq(true)
          })
          .catch(e => {
            expect(e.message).to.eq(
              "beforeFetch failed; review middleware.beforeFetch stack"
            )
            expect(e.originalError).to.eq(ABORT_ERR)
            expect(e.url).to.eq(
              "http://example.com/api/v1/authors?page[size]=1"
            )
          })
      })
    })

    describe("when afterFetch middleware aborts", () => {
      beforeEach(() => {
        mock401()
      })

      it("rejects the promise w/correct ResponseError class", () => {
        return Author.all()
          .then(({ data }) => {
            expect("dont get here!").to.eq(true)
          })
          .catch(e => {
            expect(e.message).to.eq(
              "afterFetch failed; review middleware.afterFetch stack"
            )
            expect(e.response.status).to.eq(401)
            expect(e.originalError).to.eq(ABORT_ERR)
          })
      })
    })

    describe("on 500 response", () => {
      beforeEach(() => {
        mock500()
      })

      it("rejects the promise with the response", () => {
        return Author.all()
          .then(({ data }) => {
            expect("dont get here!").to.eq(true)
          })
          .catch(e => {
            expect(e.response.statusText).to.eq("Internal Server Error")
          })
      })
    })

    describe("on a 404 response", () => {
      beforeEach(() => {
        mock404()
      })

      it("rejects the promise with RecordNotFound error", () => {
        return Author.all()
          .then(({ data }) => {
            expect("dont get here!").to.eq(true)
          })
          .catch(e => {
            expect(e.message).to.eq("record not found")
            expect(e.response.status).to.eq(404)
          })
      })
    })

    describe("on bad json response", () => {
      beforeEach(() => {
        mockBadJSON()
      })

      it("rejects the promise with original error", () => {
        return Author.all()
          .then(({ data }) => {
            expect("dont get here!").to.eq(true)
          })
          .catch(e => {
            expect(e.response.statusText).to.eq("OK")
            expect(e.originalError.message).to.match(
              /Unexpected end of JSON input/
            )
          })
      })
    })

    describe("when the model overrides the hooks", () => {
      let originalBeforeFetch: BeforeFilter | undefined
      let originalAfterFetch: AfterFilter | undefined

      beforeEach(() => {
        originalBeforeFetch = Author.beforeFetch
        originalAfterFetch = Author.afterFetch

        Author.beforeFetch = (url, options) => {
          before.overridden = true
        }

        Author.afterFetch = (url, options) => {
          after.overridden = true
        }
      })

      afterEach(() => {
        Author.beforeFetch = originalBeforeFetch
        Author.afterFetch = originalAfterFetch
      })

      it("uses the override", async () => {
        const a = Author
        await Author.all()

        expect(before).to.deep.eq({ overridden: true })
        expect(after).to.deep.eq({ overridden: true })
      })
    })
  })

  describe("writes", () => {
    describe("on successful response", () => {
      it("correctly resolves the promise", () => {
        const author = new Author()
        return author.save().then(success => {
          expect(success).to.eq(true)
        })
      })

      it("runs beforeEach hooks", () => {
        const author = new Author()
        return author.save().then(() => {
          expect(before.url).to.eq("http://example.com/api/v1/authors")
          expect(before.options).to.deep.eq({
            headers: {
              Accept: "application/json",
              "CUSTOM-HEADER": "whatever",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ data: { type: "authors" } }),
            method: "POST"
          })
        })
      })

      it("runs afterEach hooks", () => {
        const author = new Author()
        return author.save().then(() => {
          expect(after.response.status).to.eq(200)
        })
      })
    })

    describe("when beforeFetch middleware aborts", () => {
      it("rejects the promise w/correct RequestError class", () => {
        const author = new Author({ firstName: "abortme" })
        return author
          .save()
          .then(() => {
            expect("dont get here!").to.eq(true)
          })
          .catch(e => {
            expect(e.message).to.eq(
              "beforeFetch failed; review middleware.beforeFetch stack"
            )
            expect(e.originalError).to.eq(ABORT_ERR)
            expect(e.url).to.eq("http://example.com/api/v1/authors")
          })
      })
    })

    describe("when afterFetch middleware aborts", () => {
      beforeEach(() => {
        mock401()
      })

      it("rejects the promise w/correct ResponseError class", () => {
        const author = new Author()
        return author
          .save()
          .then(() => {
            expect("dont get here!").to.eq(true)
          })
          .catch(e => {
            expect(e.message).to.eq(
              "afterFetch failed; review middleware.afterFetch stack"
            )
            expect(e.response.status).to.eq(401)
            expect(e.originalError).to.eq(ABORT_ERR)
          })
      })
    })

    describe("on 500 response", () => {
      beforeEach(() => {
        mock500()
      })

      it("rejects the promise with the response", () => {
        const author = new Author()
        return author
          .save()
          .then(() => {
            expect("dont get here!").to.eq(true)
          })
          .catch(e => {
            expect(e.response.statusText).to.eq("Internal Server Error")
          })
      })
    })

    describe("on bad json response", () => {
      beforeEach(() => {
        mockBadJSON()
      })

      it("rejects the promise with original error", () => {
        const author = new Author()
        return author
          .save()
          .then(() => {
            expect("dont get here!").to.eq(true)
          })
          .catch(e => {
            expect(e.response.statusText).to.eq("OK")
            expect(e.originalError.message).to.match(
              /Unexpected end of JSON input/
            )
          })
      })
    })

    describe("when the model overrides the hooks", () => {
      let originalBeforeFetch: BeforeFilter | undefined
      let originalAfterFetch: AfterFilter | undefined

      beforeEach(() => {
        originalBeforeFetch = Author.beforeFetch
        originalAfterFetch = Author.afterFetch

        Author.beforeFetch = (url, options) => {
          before.overridden = true
        }

        Author.afterFetch = (url, options) => {
          after.overridden = true
        }
      })

      afterEach(() => {
        Author.beforeFetch = originalBeforeFetch
        Author.afterFetch = originalAfterFetch
      })

      it("uses the override", async () => {
        const author = new Author()

        await author.save()

        expect(before).to.deep.eq({ overridden: true })
        expect(after).to.deep.eq({ overridden: true })
      })
    })
  })
})
