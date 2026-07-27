import { expect, fetchMock, sinon } from "../test-helper"
import { Author, Person, Book } from "../fixtures"
import { WritePayload } from "../../src/util/write-payload"

const resetMocks = () => {
  fetchMock.restore()
}

after(() => {
  resetMocks()
})

const titles = ["The Shining", "Alice In Wonderland", "Great Expectations"]

function generateMockResponse(bookCount = 2) {
  let payload = {
    data: {
      id: "1",
      type: "authors",
      attributes: {
        first_name: "John",
        nilly: "Foobar"
      },
      relationships: {
        books: {
          data: []
        }
      }
    },
    included: []
  } as any
  let count = 0
  for (let title of titles.slice(0, bookCount)) {
    count += 1
    payload.data.relationships.books.data.push({
      id: `book${count}`,
      type: "books"
    })
    payload.included.push({
      id: `book${count}`,
      type: "books",
      attributes: {
        title: title
      }
    })
  }
  return payload
}

describe("Lookup additional data during persistence operation", () => {
  beforeEach(() => {
    resetMocks()
  })

  describe("#save()", () => {
    describe("when creating a new record", () => {
      beforeEach(() => {
        fetchMock.post(
          "http://example.com/api/v1/authors?extra_fields[authors]=nilly&include=books",
          generateMockResponse()
        )
      })

      it("accepts a scope for looking up additional items", async () => {
        let author = new Author({
          firstName: "Steven"
        })

        let returnScope = Author.includes("books").selectExtra(["nilly"])

        await author.save({ returnScope })

        expect(author.nilly).to.eq("Foobar")
        expect(author.books.length).to.eq(2)
        expect(author.books[0].title).to.eq(titles[0])
      })

      it("raises an error if a scope for a different model is passed", async () => {
        let person = new Person({
          firstName: "Steven"
        })

        let returnScope = Author.includes("books").selectExtra(["nilly"])

        try {
          await person.save({ returnScope })
          expect(true).to.eq(false)
        } catch (err) {
          expect(err.message).to.match(
            /returnScope must be a scope of type Scope<Person>/
          )
        }
      })
    })

    describe("when updating an existing record", () => {
      beforeEach(() => {
        fetchMock.patch(
          "http://example.com/api/v1/authors/1?extra_fields[authors]=nilly&include=books",
          generateMockResponse()
        )
      })

      it("accepts a scope for looking up additional items", async () => {
        let author = new Author({
          id: "1",
          firstName: "Steven"
        })

        author.isPersisted = true

        let returnScope = Author.includes("books").selectExtra(["nilly"])

        await author.save({ returnScope })

        expect(author.nilly).to.eq("Foobar")
        expect(author.books.length).to.eq(2)
        expect(author.books[0].title).to.eq(titles[0])
      })
    })

    describe("when updating an existing record with relation deletions", () => {
      beforeEach(() => {
        fetchMock.patch(
          "http://example.com/api/v1/authors/1?include=books",
          generateMockResponse(1)
        )
      })

      it("accepts a scope for looking up resulting additional items", async () => {
        let author = new Author({
          id: "1",
          firstName: "Steven"
        })
        author.isPersisted = true

        let book2 = new Book({ id: "book2" })
        book2.isPersisted = true
        book2.isMarkedForDestruction = true
        author.books.push(book2)

        let book3 = new Book({ id: "book3" })
        book3.isPersisted = true
        book3.isMarkedForDestruction = true
        author.books.push(book3)

        let returnScope = Author.includes("books")

        await author.save({ with: "books", returnScope })

        expect(author.books.length).to.eq(1)
        expect(author.books[0].title).to.eq(titles[0])
      })
    })
  })
})
