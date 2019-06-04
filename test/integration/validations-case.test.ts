import { expect, sinon, fetchMock } from "../test-helper"
import { Person, PersonDetail } from "../fixtures"
import { tempId } from "../../src/util/temp-id"
import { SpraypaintBase, ModelRecord } from "../../src/model"
import { ValidationError } from "../../src/validation-errors"

const mockErrors = {
  personDetailBase: {
    code: "unprocessable_entity",
    status: "422",
    title: "Validation Error",
    detail: "base some error",
    meta: {
      relationship: {
        name: "person_detail",
        type: "person_details",
        ["temp-id"]: "abc1",
        id: "1",
        attribute: "base",
        message: "some error"
      }
    }
  }
} as any

const resetMocks = () => {
  fetchMock.restore()

  let errors = []

  for (let key in mockErrors) {
    errors.push(mockErrors[key])
  }

  fetchMock.mock({
    matcher: "*",
    response: {
      status: 422,
      body: {
        errors
      }
    }
  })
}

let instance: Person
let tempIdIndex = 0
describe("validations", () => {
  beforeEach(() => {
    resetMocks()
  })

  beforeEach(() => {
    sinon.stub(tempId, "generate").callsFake(() => {
      tempIdIndex++
      return `abc${tempIdIndex}`
    })

    const personDetail = new PersonDetail({ id: "1" })
    personDetail.isPersisted = true
    instance = new Person({
      personDetail
    })
  })

  afterEach(() => {
    tempIdIndex = 0
    ;(<any>tempId.generate).restore()
  })

  it("applies errors to nested belongsTo relationships with underscores", async () => {
    const isSuccess = await instance.save({ with: ["person_details"] })
    expect(instance.isPersisted).to.eq(false)
    expect(isSuccess).to.eq(false)
    expect(instance.personDetail.errors).to.deep.equal({
      base: {
        title: "Validation Error",
        attribute: "base",
        code: "unprocessable_entity",
        fullMessage: "some error",
        message: "some error",
        rawPayload: mockErrors.personDetailBase
      }
    })
  })
})
