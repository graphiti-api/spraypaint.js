import { expect } from "../test-helper"
import { Person } from "../fixtures"
import { JsonapiCollectionDoc, JsonapiResource } from "../../src/index"

import { CollectionProxy } from "../../src/proxies/collection-proxy"

describe("CollectionProxy", () => {
  let personData: JsonapiCollectionDoc
  let recordArray: Person[]

  beforeEach(() => {
    personData = {
      data: [
        {
          id: "1",
          type: "people",
          attributes: {
            firstName: "Donald",
            lastName: "Budge"
          }
        }
      ],
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

    recordArray = []

    personData.data.map((datum: JsonapiResource) => {
      recordArray.push(Person.fromJsonapi(datum, personData))
    })
  })

  describe("initialization", () => {
    it("should assign the response correctly", () => {
      const collection = new CollectionProxy(recordArray, personData)
      expect(collection.raw).to.deep.equal(personData)
    })

    it("should assign the correct models to the data array", () => {
      const collection = new CollectionProxy(recordArray, personData)
      collection.data.forEach(item => {
        expect(item).to.be.instanceof(Person)
      })
    })
  })

  describe("#meta", () => {
    it("should get meta field from raw response", () => {
      const collection = new CollectionProxy(recordArray, personData)
      expect(collection.meta).to.deep.eq(personData.meta)
    })

    describe("meta is null", () => {
      beforeEach(() => {
        personData = {
          data: []
        }
      })

      it("should return an empty object", () => {
        const collection = new CollectionProxy(recordArray, personData)
        expect(collection.meta).to.deep.eq({})
      })
    })
  })
})
