import { expect, sinon, fetchMock } from "../test-helper"
import { Author, Book, Genre } from "../fixtures"
import { tempId } from "../../src/util/temp-id"
import { SpraypaintBase, ModelRecord } from "../../src/model"
import { ValidationError } from "../../src/validation-errors"

const mockErrors = {
  firstName: {
    code: "unprocessable_entity",
    status: "422",
    title: "Validation Error",
    detail: "First Name cannot be blank",
    meta: { attribute: "first_name", message: "cannot be blank" }
  },
  lastName: {
    code: "unprocessable_entity",
    status: "422",
    title: "Validation Error",
    detail: "Last Name cannot be blank",
    meta: { attribute: "last-name", message: "cannot be blank" }
  },
  bookTitle: {
    code: "unprocessable_entity",
    status: "422",
    title: "Validation Error",
    detail: "Title cannot be blank",
    meta: {
      relationship: {
        name: "books",
        type: "books",
        ["temp-id"]: "abc1",
        attribute: "title",
        message: "cannot be blank"
      }
    }
  },
  bookGenreName: {
    code: "unprocessable_entity",
    status: "422",
    title: "Validation Error",
    detail: "Name cannot be blank",
    meta: {
      relationship: {
        name: "books",
        type: "books",
        ["temp-id"]: "abc1",
        relationship: {
          name: "genre",
          type: "genres",
          id: "1",
          attribute: "name",
          message: "cannot be blank"
        }
      }
    }
  },
  bookGenreBase: {
    code: "unprocessable_entity",
    status: "422",
    title: "Validation Error",
    detail: "base some error",
    meta: {
      relationship: {
        name: "books",
        type: "books",
        ["temp-id"]: "abc1",
        relationship: {
          name: "genre",
          type: "genres",
          id: "1",
          attribute: "base",
          message: "some error"
        }
      }
    }
  }
} as any

const resetMocks = () => {
  fetchMock.restore()

  let errors = []

  for(let key in mockErrors) {
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

let instance: Author
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

    instance = new Author({ lastName: "King" })
    const genre = new Genre({ id: "1" })
    genre.isPersisted = true
    const book = new Book({ title: "blah", genre })
    instance.books = [book]
  })

  afterEach(() => {
    tempIdIndex = 0
    ;(<any>tempId.generate).restore()
  })

  it("applies errors to the instance", async () => {
    const isSuccess = await instance.save({ with: { books: "genre" } })

    expect(instance.isPersisted).to.eq(false)
    expect(isSuccess).to.eq(false)
    expect(instance.errors).to.deep.equal({
      firstName: {
        attribute: "first_name",
        code: "unprocessable_entity",
        fullMessage: "First Name cannot be blank",
        message: "cannot be blank",
        title: "Validation Error",
        rawPayload: mockErrors.firstName,
      },
      lastName: {
        attribute: "last-name",
        code: "unprocessable_entity",
        fullMessage: "Last Name cannot be blank",
        message: "cannot be blank",
        title: "Validation Error",
        rawPayload: mockErrors.lastName,
      }
    })
  })

  describe("when keyCase.to is snake", () => {
    beforeEach(() => {
      instance.klass.keyCase.client = "snake"
    })

    afterEach(() => {
      instance.klass.keyCase.client = "camel"
    })

    it("does not camelize the error keys", async () => {
      await instance.save({ with: { books: "genre" } })

      expect(instance.errors).to.deep.equal({
        first_name: {
          attribute: "first_name",
          code: "unprocessable_entity",
          fullMessage: "First Name cannot be blank",
          message: "cannot be blank",
          title: "Validation Error",
          rawPayload: mockErrors.firstName,
        },
        last_name: {
          attribute: "last-name",
          code: "unprocessable_entity",
          fullMessage: "Last Name cannot be blank",
          message: "cannot be blank",
          title: "Validation Error",
          rawPayload: mockErrors.lastName,
        }
      })
    })
  })

  it("clears errors on save", async () => {
    fetchMock.restore()
    fetchMock.mock({
      matcher: "*",
      response: { data: { id: "1", type: "employees" } }
    })

    await instance.save()

    expect(instance.errors).to.deep.eq({})
  })

  it("clears errors via the public setter", async () => {
    fetchMock.restore()
    fetchMock.mock({
      matcher: "*",
      response: { data: { id: "1", type: "employees" } }
    })
    let spy = (<any>sinon.spy)(instance, "errors", ["set"])

    await instance.save()

    expect(spy.set).to.have.been.calledOnce
  })

  it("instantiates a new error object instance after save", async () => {
    instance.errors = {
      nilly: {
        title: "Validation Error",
        attribute: "nilly",
        code: "required",
        message: "is required",
        fullMessage: "Nilly is required",
        rawPayload: { foo: 'bar' }
      }
    }

    const originalErrors = instance.errors
    const result = instance.save({ with: { books: "genre" } })
    const postSavePreValidateErrors = instance.errors

    expect(postSavePreValidateErrors).not.to.equal(originalErrors)

    await result
  })

  it("instantiates a new error object instance after validate", async () => {
    const result = instance.save({ with: { books: "genre" } })
    const postSavePreValidateErrors = instance.errors

    await result

    const postValidateErrors = instance.errors
    expect(postValidateErrors).not.to.equal(postSavePreValidateErrors)
  })

  it("applies errors to nested hasMany relationships", async () => {
    const isSuccess = await instance.save({ with: { books: "genre" } })

    expect(instance.isPersisted).to.eq(false)
    expect(isSuccess).to.eq(false)
    expect(instance.books[0].errors).to.deep.equal({
      title: {
        title: "Validation Error",
        attribute: "title",
        code: "unprocessable_entity",
        message: "cannot be blank",
        fullMessage: "Title cannot be blank",
        rawPayload: mockErrors.bookTitle,
      }
    })
  })

  it("applies errors to nested belongsTo relationships", async () => {
    const isSuccess = await instance.save({ with: { books: "genre" } })

    expect(instance.isPersisted).to.eq(false)
    expect(isSuccess).to.eq(false)

    // note we're validating multiple properties
    expect(instance.books[0].genre.errors).to.deep.equal({
      name: {
        title: "Validation Error",
        attribute: "name",
        code: "unprocessable_entity",
        fullMessage: "Name cannot be blank",
        message: "cannot be blank",
        rawPayload: mockErrors.bookGenreName,
      },
      base: {
        title: "Validation Error",
        attribute: "base",
        code: "unprocessable_entity",
        fullMessage: "some error",
        message: "some error",
        rawPayload: mockErrors.bookGenreBase,
      }
    })
  })
})
