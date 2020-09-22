import { sinon, expect, fetchMock } from "../test-helper"
import { Person, Author, Book, PersonDetail } from "../fixtures"
import { IResultProxy } from "../../src/proxies/index"

// This is a Vue-specific test. Since isPersisted is already true,
// Vue will prevent the setter from firing. We cannot rely on
// side-effect behavior of model.isPersisted = true
// So, ensure we at least call reset() explicitly
describe("Dirty tracking", () => {
  let responsePayload = (type: string, attributes: object) => {
    return {
      data: {
        id: "1",
        type: "people",
        attributes: { attributes }
      }
    }
  }

  afterEach(() => {
    fetchMock.restore()
  })

  beforeEach(() => {
    let url = "http://example.com/api"
    fetchMock.post(
      `${url}/v1/authors`,
      responsePayload("people", { firstName: "John" })
    )
    fetchMock.patch(
      `${url}/v1/authors/1`,
      responsePayload("people", { firstName: "Jake" })
    )

    fetchMock.post(
      `${url}/person_details`,
      responsePayload("person_detail", {
        address: "157 My Street, London, England",
        coordinates: {
          lon: 3,
          lat: 48
        }
      })
    )
  })

  describe("when persisted, dirty, updated", () => {
    it("calls reset()", async () => {
      let instance = new Author({ firstName: "John" })
      await instance.save()
      expect(instance.isPersisted).to.eq(true)
      expect(instance.isDirty()).to.eq(false)
      instance.firstName = "Jake"
      expect(instance.isDirty()).to.eq(true)
      let spy = sinon.spy()
      instance.reset = spy
      await instance.save()
      expect(spy.callCount).to.eq(2)
    })
  })

  describe("when custom dirty checker", () => {
    it("handle custom checker", async () => {
      let instance = new PersonDetail({
        address: "157 My Street, London, England"
      })
      instance.coordinates = {
        lon: 3,
        lat: 48
      }
      await instance.save()
      expect(instance.isPersisted).to.eq(true)
      console.log(instance.changes())
      expect(instance.isDirty()).to.eq(false)

      instance.coordinates.lon = 4
      expect(instance.isDirty()).to.eq(true)

      instance.coordinates = {
        lon: 3,
        lat: 48
      }
      expect(instance.isDirty()).to.eq(false)
    })
  })
})
