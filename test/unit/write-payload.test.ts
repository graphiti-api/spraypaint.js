import { sinon, expect } from "../test-helper"
import { WritePayload } from "../../src/util/write-payload"
import { Person, PersonWithDasherizedKeys } from "../fixtures"

describe("WritePayload", () => {
  it("underscores attributes", function() {
    let person = new Person({ first_name: "Joe" })
    let payload = new WritePayload(person, true)
    expect(payload.asJSON()).to.deep.equal({
      data: {
        type: "people",
        attributes: {
          first_name: "Joe"
        }
      }
    })
  })

  xit("dasherizes attributes", function() {
    let person = new PersonWithDasherizedKeys({ first_name: "Joe" })
    let payload = new WritePayload(person, true)
    expect(payload.asJSON()).to.deep.equal({
      data: {
        type: "people",
        attributes: {
          "first-name": "Joe"
        }
      }
    })
  })
})
