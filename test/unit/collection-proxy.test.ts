import { expect } from '../test-helper';
import { Person } from '../fixtures';

import { CollectionProxy } from '../../src/proxies/collection-proxy'

describe('CollectionProxy', function() {
  let personData : JsonapiCollectionDoc
  let recordArray : Person[]

  beforeEach(() => {
    personData = {
      data: [
        {
          id: '1',
          type: 'people',
          attributes: {
            firstName: 'Donald',
            lastName: 'Budge'
          },
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

    personData.data.map((datum : JsonapiResource) => {
      recordArray.push(Person.fromJsonapi(datum, personData));
    });
  })

  describe('initialization', function() {
    it('should assign the response correctly', function() {
      let collection = new CollectionProxy(recordArray, personData)
      expect(collection.raw).to.deep.equal(personData)
    })

    it('should assign the correct models to the data array', function() {
      let collection = new CollectionProxy(recordArray, personData)
      collection.data.forEach((item) => {
        expect(item).to.be.instanceof(Person)
      })
    })
  })

  describe('#meta', function() {
    it('should get meta field from raw response', function() {
      let collection = new CollectionProxy(recordArray, personData)
      expect(collection.meta).to.deep.eq(personData.meta)
    })

    describe('meta is null', function() {
      let personData = {
        data: [],
      }

      it('should return an empty object', function() {
        let collection = new CollectionProxy(recordArray, personData)
        expect(collection.meta).to.deep.eq({})
      })
    })
  })
})

