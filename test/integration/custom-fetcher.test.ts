import { expect, sinon } from "../test-helper"
import { Person } from "../fixtures"
import fetchMock = require("fetch-mock")

describe("Custom fetcher", () => {
  const oldFetch = Person.fetcher
  let spy: sinon.SinonSpy

  beforeEach(() => {
    spy = sinon.spy(() =>
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
    )

    Person.fetcher = spy
  })

  afterEach(() => {
    Person.fetcher = oldFetch
  })

  it("calls the custom fetcher", async () => {
    await Person.find(1)

    expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith(
      "http://example.com/api/v1/people/1"
    )
  })
})
