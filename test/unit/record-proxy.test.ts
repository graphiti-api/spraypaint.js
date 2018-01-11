import { expect } from "../test-helper"
import { Person } from "../fixtures"
import { RecordProxy } from "../../src/proxies"
import { JsonapiResourceDoc, JsonapiResource } from "../../src/index"

describe("RecordProxy", () => {
  let modelRecord: Person
  let personData: JsonapiResourceDoc

  beforeEach(() => {
    personData = {
      data: {
        id: "1",
        type: "people",
        attributes: {
          firstName: "Donald",
          lastName: "Budge"
        }
      },
      meta: {
        stats: {
          total: {
            count: 3
          },
          average: {
            salary: "$100k"
          }
        }
      }
    }
  })

  beforeEach(() => {
    if (personData.data === undefined) {
      return
    }
    modelRecord = Person.fromJsonapi(
      personData.data as JsonapiResource,
      personData
    )
  })

  describe("initialization", () => {
    it("should assign the response correctly", () => {
      const record = new RecordProxy(modelRecord, personData)
      expect(record.raw).to.deep.equal(personData)
    })

    it("should assign the correct model to the data field", () => {
      const record = new RecordProxy(modelRecord, personData)
      expect(record.data).to.be.instanceof(Person)
    })
  })

  describe("#meta", () => {
    it("should get meta field from raw response", () => {
      const record = new RecordProxy(modelRecord, personData)
      expect(record.meta).to.deep.eq(personData.meta)
    })

    describe("meta is null", () => {
      beforeEach(() => {
        personData = {
          data: {
            id: "1",
            type: "people",
            attributes: {
              firstName: "Donald",
              lastName: "Budge"
            }
          }
        }
      })

      it("should return an empty object", () => {
        const record = new RecordProxy(modelRecord, personData)
        expect(record.meta).to.deep.eq({})
      })
    })
  })
})
