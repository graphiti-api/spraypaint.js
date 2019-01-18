import { expect, fetchMock, sinon } from "../test-helper"
import { Author, Person } from "../fixtures"

const resetMocks = () => {
  fetchMock.restore()
}

after(() => {
  resetMocks()
})

function generateMockResponse() {
  return {
    data: {
      id: "1",
      type: "authors",
      attributes: {
        first_name: "John",
        nilly: "Foobar"
      },
      relationships: {
        books: {
          data: [
            {
              id: "book1",
              type: "books"
            },
            {
              id: "book3",
              type: "books"
            }
          ]
        }
      }
    },
    included: [
      {
        id: "book1",
        type: "books",
        attributes: {
          title: "The Shining"
        }
      },
      {
        id: "book3",
        type: "books",
        attributes: {
          title: "Alice in Wonderland"
        }
      }
    ]
  } as any
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
        expect(author.books[0].title).to.eq("The Shining")
      })

      it.only("raises an error if a scope for a different model is passed", async () => {
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
        expect(author.books[0].title).to.eq("The Shining")
      })
    })
  })
})
