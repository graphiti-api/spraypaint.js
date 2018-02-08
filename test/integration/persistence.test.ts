import { expect, fetchMock } from "../test-helper"
import { Person, PersonWithExtraAttr } from "../fixtures"
import { JsonapiRequestDoc, JsonapiResponseDoc } from "../../src/index"

after(() => {
  fetchMock.restore()
})

let instance: Person
let payloads: JsonapiRequestDoc[]
let patchPayloads: JsonapiRequestDoc[]
let deletePayloads: object[]
let serverResponse: JsonapiResponseDoc

beforeEach(() => {
  payloads = []
  patchPayloads = []
  deletePayloads = []
  instance = new Person()
  serverResponse = {
    data: {
      id: "1",
      type: "employees",
      attributes: { first_name: "Joe" }
    }
  }
})

const resetMocks = () => {
  fetchMock.restore()

  fetchMock.post("http://example.com/api/v1/people", (url, payload: any) => {
    payloads.push(JSON.parse(payload.body))
    return serverResponse
  })

  fetchMock.patch("http://example.com/api/v1/people/1", (url, payload: any) => {
    patchPayloads.push(JSON.parse(payload.body))
    return serverResponse
  })

  fetchMock.delete(
    "http://example.com/api/v1/people/1",
    (url, payload: any) => {
      deletePayloads.push({})
      return { meta: {} }
    }
  )
}

describe("Model persistence", () => {
  beforeEach(() => {
    resetMocks()
  })

  describe("#save()", () => {
    describe("when an unpersisted attr", () => {
      it("does not send the attr to server", async () => {
        instance = new PersonWithExtraAttr({ extraThing: "foo" })
        expect((<PersonWithExtraAttr>instance).extraThing).to.eq("foo")

        await instance.save()

        expect((<any>payloads[0]).data.attributes).to.eq(undefined)
      })
    })

    describe("when the model is already persisted", () => {
      beforeEach(() => {
        instance.id = "1"
        instance.isPersisted = true
      })

      it("updates instead of creates", async () => {
        instance.firstName = "Joe"
        await instance.save()

        expect(patchPayloads[0]).to.deep.equal({
          data: {
            id: "1",
            type: "people",
            attributes: {
              first_name: "Joe"
            }
          }
        })
      })

      it("preserves persistence data", async () => {
        instance.firstName = "Joe"
        const bool = await instance.save()

        expect(bool).to.eq(true)
        expect(instance.id).to.eq("1")
        expect(instance.isPersisted).to.eq(true)
      })

      describe("when no dirty attributes", () => {
        beforeEach(() => {
          instance.firstName = "Joe"
          instance.isPersisted = true
        })

        it("does not send attributes to the server", async () => {
          await instance.save()

          expect(patchPayloads[0]).to.deep.equal({
            data: {
              id: "1",
              type: "people"
            }
          })
        })
      })
    })

    describe("when the model is not already persisted", () => {
      it("makes the correct HTTP call", async () => {
        instance.firstName = "Joe"
        await instance.save()

        expect(payloads[0]).to.deep.equal({
          data: {
            type: "people",
            attributes: {
              first_name: "Joe"
            }
          }
        })
      })

      describe("when the response is 200", () => {
        it("marks the instance as persisted", async () => {
          expect(instance.isPersisted).to.eq(false)

          await instance.save()

          expect(instance.isPersisted).to.eq(true)
        })

        it("sets the id of the record", async () => {
          expect(instance.isPersisted).to.eq(false)

          await instance.save()

          expect(instance.id).to.eq("1")
        })

        it("resolve the promise to true", async () => {
          const bool = await instance.save()

          expect(bool).to.eq(true)
        })

        it("updates attributes set by the server", async () => {
          serverResponse = {
            data: {
              id: "1",
              type: "employees",
              attributes: {
                first_name: "From Server"
              }
            }
          }
          instance.firstName = "From Client"

          await instance.save()

          expect(instance.firstName).to.eq("From Server")
        })
      })

      describe("when the response is 500", () => {
        beforeEach(() => {
          fetchMock.restore()

          fetchMock.mock({
            matcher: "http://example.com/api/v1/people",
            response: { status: 500, body: { errors: [] } }
          })
        })

        afterEach(() => {
          resetMocks()
        })

        it("rejects the promise", async () => {
          try {
            await instance.save()
          } catch (err) {
            expect(err.message).to.eq("Server Error")
          }
        })
      })

      describe("when the response is 422", () => {
        beforeEach(() => {
          fetchMock.restore()

          fetchMock.mock({
            matcher: "http://example.com/api/v1/people",
            response: { status: 422, body: { errors: [] } }
          })
        })

        afterEach(() => {
          resetMocks()
        })

        it("does not mark the instance as persisted", async () => {
          await instance.save()

          expect(instance.isPersisted).to.eq(false)
        })

        it("resolves the promise to false", async () => {
          const bool = await instance.save()

          expect(bool).to.eq(false)
        })
      })

      describe("when an attribute is explicitly set as null", () => {
        it("sends the attribute as part of the payload", async () => {
          instance.firstName = "Joe"
          instance.lastName = null

          await instance.save()

          expect(payloads[0]).to.deep.equal({
            data: {
              type: "people",
              attributes: {
                first_name: "Joe",
                last_name: null
              }
            }
          })
        })
      })
    })
  })

  describe("#destroy", () => {
    beforeEach(() => {
      instance.id = "1"
      instance.isPersisted = true
    })

    it("makes correct DELETE request", async () => {
      await instance.destroy()

      expect(deletePayloads.length).to.eq(1)
    })

    it("marks object as not persisted", async () => {
      expect(instance.isPersisted).to.eq(true)
      await instance.destroy()

      expect(instance.isPersisted).to.eq(false)
    })

    describe("when the server returns 204 no content", () => {
      beforeEach(() => {
        fetchMock.restore()

        fetchMock.mock({
          matcher: "http://example.com/api/v1/people/1",
          response: new Response({ status: 204 })
        })
      })

      afterEach(() => {
        resetMocks()
      })

      it("does not blow up", async () => {
        expect(instance.isPersisted).to.eq(true)
        await instance.destroy()

        expect(instance.isPersisted).to.eq(false)
      })
    })

    describe("when the server returns 202 accepted", () => {
      beforeEach(() => {
        fetchMock.restore()

        fetchMock.mock({
          matcher: "http://example.com/api/v1/people/1",
          response: new Response({ status: 202 })
        })
      })

      afterEach(() => {
        resetMocks()
      })

      it("does not blow up", async () => {
        expect(instance.isPersisted).to.eq(true)
        await instance.destroy()

        expect(instance.isPersisted).to.eq(false)
      })
    })

    describe("when the server returns 422", () => {
      beforeEach(() => {
        fetchMock.restore()

        fetchMock.mock({
          matcher: "http://example.com/api/v1/people/1",
          response: { status: 422, body: { errors: [] } }
        })
      })

      afterEach(() => {
        resetMocks()
      })

      it("does not mark the object as unpersisted", async () => {
        await instance.destroy()

        expect(instance.isPersisted).to.eq(true)
      })
    })

    describe("when the server returns 500", () => {
      beforeEach(() => {
        fetchMock.restore()

        fetchMock.mock({
          matcher: "http://example.com/api/v1/people/1",
          response: { status: 500, body: { errors: [] } }
        })
      })

      afterEach(() => {
        resetMocks()
      })

      it("rejects the promise", async () => {
        try {
          await instance.destroy()
        } catch (err) {
          expect(err.message).to.eq("Server Error")
        }
      })
    })
  })
})
