import { sinon, expect } from "../test-helper"
import { WritePayload } from "../../src/util/write-payload"
import {
  Person,
  PersonWithDasherizedKeys,
  Author,
  Genre,
  Book
} from "../fixtures"

describe("WritePayload", () => {
  it("Does not serialize number attributes as empty string", () => {
    let person = new Person({ first_name: "Joe", age: 23 })
    ;(person.age as any) = ""
    person.lastName = ""
    let payload = new WritePayload(person)
    expect(payload.asJSON()).to.deep.equal({
      data: {
        type: "people",
        attributes: {
          first_name: "Joe",
          last_name: "",
          age: null
        }
      }
    })
  })

  it("underscores attributes", () => {
    let person = new Person({ first_name: "Joe" })
    let payload = new WritePayload(person)
    expect(payload.asJSON()).to.deep.equal({
      data: {
        type: "people",
        attributes: {
          first_name: "Joe"
        }
      }
    })
  })

  it("dasherizes attributes", () => {
    let person = new PersonWithDasherizedKeys({ first_name: "Joe" })
    let payload = new WritePayload(person)
    expect(payload.asJSON()).to.deep.equal({
      data: {
        type: "people",
        attributes: {
          "first-name": "Joe"
        }
      }
    })
  })

  describe("sends persisted singular relationships defined via", () => {
    const genre = new Genre({ name: "Horror", id: "1" })
    genre.isPersisted = true
    const expectedPayload = {
      data: {
        type: "authors",
        relationships: {
          genre: {
            data: {
              id: "1",
              type: "genres",
              method: "update"
            }
          }
        }
      },
      included: [
        {
          id: "1",
          type: "genres"
        }
      ]
    }

    it("constructor", () => {
      const author = new Author({ genre: genre })
      const payload = new WritePayload(author, ["genre"])
      expect(payload.asJSON()).to.deep.equal(expectedPayload)
    })

    it("direct assignment", () => {
      const author = new Author()
      author.genre = genre
      const payload = new WritePayload(author, ["genre"])
      expect(payload.asJSON()).to.deep.equal(expectedPayload)
    })
  })

  describe("sends persisted plural relationships defined via", () => {
    const book = new Book({ title: "Horror", id: "1" })
    book.isPersisted = true
    const expectedPayload = {
      data: {
        type: "authors",
        relationships: {
          books: {
            data: [
              {
                id: "1",
                type: "books",
                method: "update"
              }
            ]
          }
        }
      },
      included: [
        {
          id: "1",
          type: "books"
        }
      ]
    }

    it("constructor", () => {
      const author = new Author({ books: [book] })
      const payload = new WritePayload(author, ["books"])
      expect(payload.asJSON()).to.deep.equal(expectedPayload)
    })

    it("direct assignment", () => {
      const author = new Author()
      author.books.push(book)
      const payload = new WritePayload(author, ["books"])
      expect(payload.asJSON()).to.deep.equal(expectedPayload)
    })
  })

  it("does not send persisted relationships defined via constructor if not included", () => {
    const genre = new Genre({ name: "Horror", id: "1" })
    genre.isPersisted = true
    const author = new Author({ genre })
    const payload = new WritePayload(author)
    expect(payload.asJSON()).to.deep.equal({
      data: {
        type: "authors"
      }
    })
  })
})
