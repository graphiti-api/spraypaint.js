import { expect } from '../test-helper';
import { Person } from '../fixtures';
import { RecordProxy } from '../../src/proxies'

describe('RecordProxy', function() {
  let modelRecord : Person | undefined
  let personData : JsonapiResourceDoc 

  beforeEach(() => {
    personData = {
      data: {
        id: '1',
        type: 'people',
        attributes: {
          firstName: 'Donald',
          lastName: 'Budge'
        },
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
    if (personData.data === undefined) { return }
    modelRecord = Person.fromJsonapi(personData.data as JsonapiResource, personData)
  })

  describe('initialization', function() {
    it('should assign the response correctly', function() {
      let record = new RecordProxy(modelRecord, personData)
      expect(record.raw).to.deep.equal(personData)
    })

    it('should assign the correct model to the data field', function() {
      let record = new RecordProxy(modelRecord, personData)
      expect(record.data).to.be.instanceof(Person)
    })

    context('record is null is null', function() {
      beforeEach(() => {
        personData = {
          data: undefined
        }

        modelRecord = undefined
      })

      it('should assign data to null', function() {
        let record = new RecordProxy(modelRecord, personData)
        expect(record.data).to.eq(null)
      })
    })
  })

  describe('#meta', function() {
    it('should get meta field from raw response', function() {
      let record = new RecordProxy(modelRecord, personData)
      expect(record.meta).to.deep.eq(personData.meta)
    })

    describe('meta is null', function() {
      beforeEach(() => {
        personData = {
          data: {
            id: '1',
            type: 'people',
            attributes: {
              firstName: 'Donald',
              lastName: 'Budge'
            },
          }
        }
      })

      it('should return an empty object', function() {
        let record = new RecordProxy(modelRecord, personData)
        expect(record.meta).to.deep.eq({})
      })
    })
  })
})

