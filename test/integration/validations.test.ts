import { expect, sinon, fetchMock } from "../test-helper"
import { Author, Book, Genre, Person, PersonDetail } from "../fixtures"
import { tempId } from "../../src/util/temp-id"
import { SpraypaintBase, ModelRecord } from "../../src/model"
import { ValidationError } from "../../src/validation-errors"

const resetMocks = (mockErrors: any, status: number = 422) => {
  fetchMock.restore()

  let errors = []

  for (let key in mockErrors) {
    errors.push(mockErrors[key])
  }

  fetchMock.mock({
    matcher: "*",
    response: {
      status: status,
      body: {
        errors
      }
    }
  })
}

let tempIdIndex = 0
describe("validations (1/3)", () => {
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
    secondBookTitle: {
      code: "unprocessable_entity",
      status: "422",
      title: "Validation Error",
      detail: "Title cannot be blank",
      meta: {
        relationship: {
          name: "books",
          type: "books",
          ["temp-id"]: "abc2",
          attribute: "title",
          message: "cannot be blank"
        }
      }
    },
    fourthBookTitle: {
      code: "unprocessable_entity",
      status: "422",
      title: "Validation Error",
      detail: "Title cannot be blank",
      meta: {
        relationship: {
          name: "books",
          type: "books",
          ["temp-id"]: "abc4",
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
            // For some reason graphiti is returning these as integers
            id: 2,
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
            // For some reason graphiti is returning these as integers
            id: 2,
            attribute: "base",
            message: "some error"
          }
        }
      }
    }
  } as any

  let instance: Author

  beforeEach(() => {
    resetMocks(mockErrors)
  })

  beforeEach(() => {
    sinon.stub(tempId, "generate").callsFake(() => {
      tempIdIndex++
      return `abc${tempIdIndex}`
    })
    instance = new Author({ lastName: "King" })
    const genre1 = new Genre({ id: "1" })
    genre1.isPersisted = true

    const genre2 = new Genre({ id: "2" })
    genre2.isPersisted = true

    const book1 = new Book({ title: "blah 1", genre: genre1 })
    const book2 = new Book({ title: "blah 2", genre: genre2 })
    const book3 = new Book({ title: "blah 3", genre: genre1 })
    const book4 = new Book({ title: "blah 4", genre: genre2 })
    const book5 = new Book({ title: "blah 5", genre: genre1 })
    instance.books = [book1, book2, book3, book4, book5]
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
        rawPayload: mockErrors.firstName
      },
      lastName: {
        attribute: "last-name",
        code: "unprocessable_entity",
        fullMessage: "Last Name cannot be blank",
        message: "cannot be blank",
        title: "Validation Error",
        rawPayload: mockErrors.lastName
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
          rawPayload: mockErrors.firstName
        },
        last_name: {
          attribute: "last-name",
          code: "unprocessable_entity",
          fullMessage: "Last Name cannot be blank",
          message: "cannot be blank",
          title: "Validation Error",
          rawPayload: mockErrors.lastName
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
        rawPayload: { foo: "bar" }
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

    // We have only put errors on the 2nd (index 1) and 4th (index 3) books
    // This ensures that the correct relationship is found when matching errors

    expect(instance.books[0].errors).to.deep.equal({})
    expect(instance.books[1].errors).to.deep.equal({
      title: {
        title: "Validation Error",
        attribute: "title",
        code: "unprocessable_entity",
        message: "cannot be blank",
        fullMessage: "Title cannot be blank",
        rawPayload: mockErrors.secondBookTitle
      }
    })
    expect(instance.books[2].errors).to.deep.equal({})
    expect(instance.books[3].errors).to.deep.equal({
      title: {
        title: "Validation Error",
        attribute: "title",
        code: "unprocessable_entity",
        message: "cannot be blank",
        fullMessage: "Title cannot be blank",
        rawPayload: mockErrors.fourthBookTitle
      }
    })
    expect(instance.books[4].errors).to.deep.equal({})
  })

  it("applies errors to nested belongsTo relationships", async () => {
    const isSuccess = await instance.save({ with: { books: "genre" } })

    expect(instance.isPersisted).to.eq(false)
    expect(isSuccess).to.eq(false)

    const expectedErrors = {
      name: {
        title: "Validation Error",
        attribute: "name",
        code: "unprocessable_entity",
        fullMessage: "Name cannot be blank",
        message: "cannot be blank",
        rawPayload: mockErrors.bookGenreName
      },
      base: {
        title: "Validation Error",
        attribute: "base",
        code: "unprocessable_entity",
        fullMessage: "some error",
        message: "some error",
        rawPayload: mockErrors.bookGenreBase
      }
    }

    // note we're validating multiple properties
    // note we set errors on the genre with id=2 and that is on
    // books with index 0, 2, and 4.
    expect(instance.books[0].genre.errors).to.deep.equal(expectedErrors)
    expect(instance.books[1].genre.errors).to.deep.equal({})
    expect(instance.books[2].genre.errors).to.deep.equal(expectedErrors)
    expect(instance.books[3].genre.errors).to.deep.equal({})
    expect(instance.books[4].genre.errors).to.deep.equal(expectedErrors)
  })
})

describe("validations (2/3)", () => {
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
          // For some reason graphiti is returning these as integers
          id: 1,
          attribute: "base",
          message: "some error"
        }
      }
    }
  } as any

  let instance: Person

  beforeEach(() => {
    resetMocks(mockErrors)
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

describe("validations (3/3)", () => {
  const mockErrors = {
    bookTitle: {
      code: "unprocessable_entity",
      status: "422",
      title: "Validation Error",
      detail: "Title cannot be blank",
      meta: {
        relationship: {
          // For some reason graphiti is returning these as integers
          id: 30,
          // ["temp-id"]: "abc1",
          name: "books",
          type: "books",
          attribute: "title",
          message: "cannot be blank"
        }
      }
    }
  } as any

  let instance: Author

  beforeEach(() => {
    resetMocks(mockErrors)
  })

  beforeEach(() => {
    sinon.stub(tempId, "generate").callsFake(() => {
      tempIdIndex++
      return `abc${tempIdIndex}`
    })

    const genre = new Genre({ id: "20", name: "Horror" })
    genre.isPersisted = true
    const book1 = new Book({ id: "10", title: "The Shining", genre })
    book1.isPersisted = true
    const book2 = new Book({ id: "30", title: "Pet Sematary", genre })
    book2.isPersisted = true
    instance = new Author({ firstName: "Stephen", lastName: "King" })
    instance.id = "1"
    instance.books = [book1, book2]
    instance.specialBooks = []
    instance.isPersisted = true
  })

  afterEach(() => {
    tempIdIndex = 0
    ;(<any>tempId.generate).restore()
  })

  it("applies errors to objects other than the first in nested hasMany relationships", async () => {
    instance.books[1].title = ""
    const isSuccess = await instance.save({ with: { books: "genre" } })

    expect(isSuccess).to.eq(false)
    expect(instance.books[1].errors).to.deep.equal({
      title: {
        title: "Validation Error",
        attribute: "title",
        code: "unprocessable_entity",
        fullMessage: "Title cannot be blank",
        message: "cannot be blank",
        rawPayload: mockErrors.bookTitle
      }
    })
  })
})

describe("Errors without graphiti validation (1/2)", () => {
  const mockErrors = {
    noMeta: {
      code: "bad_request",
      status: "422",
      title: "Bad request",
      detail: "Length of attributes is not equal to 42"
    },
    notAnAttribute: {
      code: "bad_request",
      status: "422",
      title: "Bad request",
      detail: "Length of attributes is not equal to 42",
      meta: {
        attribute: "not_an_attribute",
        message: "not_an_attribute does not exist"
      }
    }
  } as any

  let instance: Book

  beforeEach(() => {
    resetMocks(mockErrors, 422)
  })

  beforeEach(() => {
    sinon.stub(tempId, "generate").callsFake(() => {
      tempIdIndex++
      return `abc${tempIdIndex}`
    })

    instance = new Book({ title: "Keep calm" })
  })

  afterEach(() => {
    tempIdIndex = 0
    ;(<any>tempId.generate).restore()
  })

  it("handles 422 status response without appropriate meta", async () => {
    let isSuccess = null
    try {
      isSuccess = await instance.save()
    } catch (e) {
      isSuccess = false
    }
    expect(instance.isPersisted).to.eq(false)
    expect(isSuccess).to.eq(false)
  })

  it("provides the errors on 4xx response", async () => {
    let json = null
    let status = null
    try {
      await instance.save({ with: ["person_details"] })
    } catch (e) {
      status = e.response.status
      json = await e.response.clone().json()
    }
    expect(status).to.eq(422)
    expect(instance.isPersisted).to.eq(false)
    expect(json).to.deep.equal({
      errors: [
        {
          code: "bad_request",
          status: "422",
          title: "Bad request",
          detail: "Length of attributes is not equal to 42"
        },
        {
          code: "bad_request",
          status: "422",
          title: "Bad request",
          detail: "Length of attributes is not equal to 42",
          meta: {
            attribute: "not_an_attribute",
            message: "not_an_attribute does not exist"
          }
        }
      ]
    })
  })
})

describe("Errors without graphiti validation  (2/2)", () => {
  const mockErrors = {
    general: {
      code: "bad_request",
      status: "400",
      title: "Bad request",
      detail: "Length of attributes is not equal to 42"
    }
  } as any

  let instance: Book

  beforeEach(() => {
    resetMocks(mockErrors, 400)
  })

  beforeEach(() => {
    sinon.stub(tempId, "generate").callsFake(() => {
      tempIdIndex++
      return `abc${tempIdIndex}`
    })

    instance = new Book({ title: "Keep calm" })
  })

  afterEach(() => {
    tempIdIndex = 0
    ;(<any>tempId.generate).restore()
  })

  it("handles 400 status response without appropriate meta", async () => {
    let isSuccess = null
    try {
      isSuccess = await instance.save()
    } catch (e) {
      isSuccess = false
    }
    expect(instance.isPersisted).to.eq(false)
    expect(isSuccess).to.eq(false)
  })

  it("provides the errors on 4xx response", async () => {
    let json = null
    let status = null
    try {
      await instance.save({ with: ["person_details"] })
    } catch (e) {
      status = e.response.status
      json = await e.response.clone().json()
    }

    expect(status).to.eq(400)
    expect(instance.isPersisted).to.eq(false)
    expect(json).to.deep.equal({
      errors: [
        {
          code: "bad_request",
          status: "400",
          title: "Bad request",
          detail: "Length of attributes is not equal to 42"
        }
      ]
    })
  })
})
