import { sinon } from '../../test/test-helper';
import { Person } from '../fixtures';

import CollectionProxy from '../../src/collection-proxy'

describe('CollectionProxy', function() {
  let personData = {
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
    included: [],
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

  describe('initialization', function() {
    it('should assign the response correctly', function() {
      let collection = new CollectionProxy(personData)
      expect(collection.raw).to.deep.equal(personData)
    })

    it('should assign the correct models to the data array', function() {
      let collection = new CollectionProxy(personData)
      expect(collection.data).all.to.be.instanceof(Person)
    })
  })

  describe('#meta', function() {
    it('should get meta field from raw response', function() {
      let collection = new CollectionProxy(personData)
      expect(collection.meta).to.eq(personData.meta)
    })

    describe('meta is null', function() {
      let personData = {
        data: [],
      }

      it('should return an empty object', function() {
        let collection = new CollectionProxy(personData)
        expect(collection.meta).to.deep.eq({})
      })
    })
  })
})

