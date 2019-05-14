import { expect, fetchMock } from "../test-helper"
import { Author } from "../fixtures"

describe("Rollback", () => {
  let responsePayload = (firstName: string) => {
    return {
      data: {
        id: "1",
        type: "people",
        attributes: { firstName }
      }
    }
  }

  afterEach(() => {
    fetchMock.restore()
  })

  beforeEach(() => {
    let url = "http://example.com/api/v1/authors"
    fetchMock.post(url, responsePayload("John"))
    fetchMock.patch(`${url}/1`, responsePayload("Jake"))
  })

  it("reverts changes to attributes", async () => {
    const originalFirstName = "John"
    let instance = new Author({ firstName: originalFirstName })
    await instance.save()
    expect(instance.isPersisted).to.eq(true)
    expect(instance.isDirty()).to.eq(false)
    instance.firstName = "Jake"
    expect(instance.isDirty()).to.eq(true)
    instance.rollback()
    expect(instance.isDirty()).to.eq(false)
    expect(instance.firstName).to.eq(originalFirstName)
  })
})
