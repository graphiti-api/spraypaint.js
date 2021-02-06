import { expect, sinon } from "../test-helper"
import fetchMock = require("fetch-mock")
import { Model, SpraypaintBase } from "../../src"

describe("Custom fetcher", () => {
  let spy1: sinon.SinonSpy
  let spy2: sinon.SinonSpy

  let ApplicationRecord: typeof SpraypaintBase
  let Author: typeof SpraypaintBase
  let Person: typeof SpraypaintBase

  beforeEach(() => {
    const fetcher = (a: any, b: any) =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              id: "1",
              type: "people",
              attributes: {
                firstName: "John"
              }
            }
          })
        )
      )

    spy1 = sinon.spy(fetcher)
    spy2 = sinon.spy(fetcher)

    @Model({
      baseUrl: "http://example.com",
      apiNamespace: "/api/v1"
    })
    class Base extends SpraypaintBase {}
    ApplicationRecord = Base

    @Model({
      jsonapiType: "authors",
      fetcher: spy1
    })
    class A extends ApplicationRecord {}
    Author = A

    @Model({ jsonapiType: "people" })
    class B extends ApplicationRecord {
      static fetcher = spy2
    }
    Person = B
  })

  describe("uses custom fetchers", () => {
    it("calls a custom fetcher set via config", async () => {
      await Author.find(1)

      expect(spy1).to.have.been.calledOnce.and.to.have.been.calledWith(
        "http://example.com/api/v1/authors/1"
      )
    })

    it("calls a custom fetcher set via static props", async () => {
      await Person.find(1)

      expect(spy2).to.have.been.calledOnce.and.to.have.been.calledWith(
        "http://example.com/api/v1/people/1"
      )
    })
  })
})
