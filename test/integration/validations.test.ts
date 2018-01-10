import { expect, sinon, fetchMock } from '../test-helper'
import { Author, Book, Genre } from '../fixtures'
import { tempId } from '../../src/util/temp-id'

const resetMocks = () => {
  fetchMock.restore()

  fetchMock.mock({
    matcher: '*',
    response: {
      status: 422,
      body: {
        errors: [
          {
            code: 'unprocessable_entity',
            status: '422',
            title: 'Validation Error',
            detail: 'First Name cannot be blank',
            meta: { attribute: 'first_name', message: 'cannot be blank' }
          },
          {
            code: 'unprocessable_entity',
            status: '422',
            title: 'Validation Error',
            detail: 'Last Name cannot be blank',
            meta: { attribute: 'last_name', message: 'cannot be blank' }
          },
          {
            code: 'unprocessable_entity',
            status: '422',
            title: 'Validation Error',
            detail: 'Title cannot be blank',
            meta: {
              relationship: {
                name: 'books',
                type: 'books',
                ['temp-id']: 'abc1',
                attribute: 'title',
                message: 'cannot be blank'
              }
            }
          },
          {
            code: 'unprocessable_entity',
            status: '422',
            title: 'Validation Error',
            detail: 'Name cannot be blank',
            meta: {
              relationship: {
                name: 'books',
                type: 'books',
                ['temp-id']: 'abc1',
                relationship: {
                  name: 'genre',
                  type: 'genres',
                  id: '1',
                  attribute: 'name',
                  message: 'cannot be blank'
                }
              }
            }
          },
          {
            code: 'unprocessable_entity',
            status: '422',
            title: 'Validation Error',
            detail: 'base some error',
            meta: {
              relationship: {
                name: 'books',
                type: 'books',
                ['temp-id']: 'abc1',
                relationship: {
                  name: 'genre',
                  type: 'genres',
                  id: '1',
                  attribute: 'base',
                  message: 'some error'
                }
              }
            }
          }
        ]
      }
    }
  })
}

let instance : Author
let tempIdIndex = 0
describe('validations', () => {
  beforeEach(() => {
    resetMocks()
  })

  beforeEach(() => {
    sinon.stub(tempId, 'generate').callsFake(() => {
      tempIdIndex++
      return `abc${tempIdIndex}`
    })

    instance = new Author({ lastName: 'King' })
    let genre = new Genre({ id: '1' })
    genre.isPersisted = true
    let book = new Book({ title: 'blah', genre })
    instance.books = [book]
  })

  afterEach(() => {
    tempIdIndex = 0
    ;(<any>tempId.generate)['restore']()
  })

  it('applies errors to the instance', async () => {
    let isSuccess = await instance.save({ with: { books: 'genre' }})

    expect(instance.isPersisted).to.eq(false)
    expect(isSuccess).to.eq(false)
    expect(instance.errors).to.deep.equal({
      firstName: 'cannot be blank',
      lastName: 'cannot be blank'
    })
  })

  describe('when camelizeKeys is false', () => {
    beforeEach(() => {
      instance.klass.camelizeKeys = false
    })

    afterEach(() => {
      instance.klass.camelizeKeys = true
    })

    it('does not camelize the error keys', async () => {
      await instance.save({ with: { books: 'genre' }})

      expect(instance.errors).to.deep.equal({
        first_name: 'cannot be blank',
        last_name: 'cannot be blank'
      })
    })
  })

  it('clears errors on save', async () => {
    fetchMock.restore()
    fetchMock.mock({
      matcher: '*',
      response: { data: { id: '1', type: 'employees'} }
    })
    instance.errors = { foo: 'bar' }

    await instance.save()

    expect(instance.errors).to.deep.eq({})
  })

  it('instantiates a new error object instance after save', async () => {
    let originalErrors = instance.errors = {foo: 'bar'}
    let result = instance.save({ with: { books: 'genre' }})
    let postSavePreValidateErrors = instance.errors

    expect(postSavePreValidateErrors).not.to.equal(originalErrors)

    await result
  })

  it('instantiates a new error object instance after validate', async () => {
    let result = instance.save({ with: { books: 'genre' }})
    let postSavePreValidateErrors = instance.errors

    await result

    let postValidateErrors = instance.errors
    expect(postValidateErrors).not.to.equal(postSavePreValidateErrors)
  })

  it('applies errors to nested hasMany relationships', async () => {
    let isSuccess = await instance.save({ with: { books: 'genre' }})

    expect(instance.isPersisted).to.eq(false)
    expect(isSuccess).to.eq(false)
    expect(instance.books[0].errors).to.deep.equal({
      title: 'cannot be blank',
    })
  })

  it('applies errors to nested belongsTo relationships', async () => {
    let isSuccess = await instance.save({ with: { books: 'genre' }})

    expect(instance.isPersisted).to.eq(false)
    expect(isSuccess).to.eq(false)

    // note we're validating multiple properties
    expect(instance.books[0].genre.errors).to.deep.equal({
      name: 'cannot be blank',
      base: 'some error'
    })
  })
})
