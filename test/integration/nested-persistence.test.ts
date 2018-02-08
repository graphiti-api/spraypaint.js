import { sinon, expect, fetchMock } from "../test-helper"
import { Author, Book, Genre } from "../fixtures"
import { tempId } from "../../src/util/temp-id"
import { JsonapiRequestDoc, JsonapiResponseDoc } from "../../src/index"

let instance: Author
let payloads: JsonapiRequestDoc[]
let patchPayloads: JsonapiRequestDoc[]
let deletePayloads: object[]
let serverResponse: JsonapiResponseDoc

type method = "update" | "destroy" | "disassociate"

const resetMocks = () => {
  fetchMock.restore()

  fetchMock.post("http://example.com/api/v1/authors", (url, payload: any) => {
    payloads.push(JSON.parse(payload.body))
    return serverResponse
  })

  fetchMock.patch(
    "http://example.com/api/v1/authors/1",
    (url, payload: any) => {
      patchPayloads.push(JSON.parse(payload.body))
      return serverResponse
    }
  )

  fetchMock.delete(
    "http://example.com/api/v1/authors/1",
    (url, payload: any) => {
      deletePayloads.push({})
      return serverResponse
    }
  )
}

const expectedCreatePayload: JsonapiResponseDoc = {
  data: {
    type: "authors",
    attributes: { first_name: "Stephen" },
    relationships: {
      books: {
        data: [
          {
            ["temp-id"]: "abc1",
            type: "books",
            method: "create"
          }
        ]
      },
      special_books: {
        data: [
          {
            ["temp-id"]: "abc3",
            type: "books",
            method: "create"
          }
        ]
      }
    }
  },
  included: [
    {
      ["temp-id"]: "abc1",
      type: "books",
      attributes: {
        title: "The Shining"
      },
      relationships: {
        genre: {
          data: {
            ["temp-id"]: "abc2",
            type: "genres",
            method: "create"
          }
        }
      }
    },
    {
      ["temp-id"]: "abc2",
      type: "genres",
      attributes: {
        name: "Horror"
      }
    },
    {
      ["temp-id"]: "abc3",
      type: "books",
      attributes: {
        title: "The Stand"
      }
    }
  ]
}

const expectedUpdatePayload = (payloadMethod: method): JsonapiResponseDoc => {
  return {
    data: {
      id: "1",
      type: "authors",
      relationships: {
        books: {
          data: [
            {
              id: "10",
              type: "books",
              method: payloadMethod
            }
          ]
        }
      }
    },
    included: [
      {
        id: "10",
        type: "books",
        attributes: {
          title: "Updated Book Title"
        },
        relationships: {
          genre: {
            data: {
              id: "20",
              type: "genres",
              method: payloadMethod
            }
          }
        }
      },
      {
        id: "20",
        type: "genres",
        attributes: {
          name: "Updated Genre Name"
        }
      }
    ]
  }
}

const seedPersistedData = () => {
  const genre = new Genre({ id: "20", name: "Horror" })
  genre.isPersisted = true
  const book = new Book({ id: "10", title: "The Shining", genre })
  book.isPersisted = true
  const specialBook = new Book({ id: "30", title: "The Stand" })
  specialBook.isPersisted = true
  instance.id = "1"
  instance.books = [book]
  instance.specialBooks = [specialBook]
  instance.isPersisted = true
  genre.name = "Updated Genre Name"
  book.title = "Updated Book Title"
}

describe("nested persistence", () => {
  beforeEach(() => {
    payloads = []
    patchPayloads = []
    deletePayloads = []
    instance = new Author({ firstName: "Stephen" })
    serverResponse = {
      data: {
        id: "1",
        type: "authors",
        attributes: { first_name: "first name from server" },
        relationships: {
          books: {
            data: [
              {
                id: "10",
                type: "books"
              }
            ]
          }
        }
      },
      included: [
        {
          ["temp-id"]: "abc1",
          id: "10",
          type: "books",
          attributes: { title: "title from server" },
          relationships: {
            genre: {
              data: {
                id: "20",
                type: "genres"
              }
            }
          }
        },
        {
          ["temp-id"]: "abc2",
          id: "20",
          type: "genres",
          attributes: { name: "name from server" }
        },
        {
          ["temp-id"]: "abc3",
          id: "30",
          type: "books",
          attributes: { title: "another title from server" }
        }
      ]
    }
  })

  afterEach(() => {
    fetchMock.restore()
  })

  beforeEach(() => {
    resetMocks()
  })

  let tempIdIndex = 0
  beforeEach(() => {
    sinon.stub(tempId, "generate").callsFake(() => {
      tempIdIndex++
      return `abc${tempIdIndex}`
    })
  })

  afterEach(() => {
    tempIdIndex = 0
    ;(<any>tempId.generate).restore()
  })

  describe("basic nested create", () => {
    beforeEach(() => {
      const genre = new Genre({ name: "Horror" })
      const book = new Book({ title: "The Shining", genre })
      const specialBook = new Book({ title: "The Stand" })
      instance.books = [book]
      instance.specialBooks = [specialBook]
    })

    // todo test on the way back - id set, attrs updated, isPersisted
    // todo remove #destroy? and just save when markwithpersisted? combo? for ombined payload
    // todo test unique includes/circular relationshio
    it("sends the correct payload", async () => {
      await instance.save({ with: { books: "genre", specialBooks: {} } })

      expect(payloads[0]).to.deep.equal(expectedCreatePayload)
    })

    it("assigns ids from the response", async () => {
      await instance.save({ with: { books: "genre" } })

      expect(instance.id).to.eq("1")
      expect(instance.books[0].id).to.eq("10")
      expect(instance.books[0].genre.id).to.eq("20")
    })

    // Commenting out to avoid thinking something is wrong
    // every time I see a pending test. We may be able to delete this?
    // it('removes old temp ids', async () => {
    //   await instance.save({ with: { books: 'genre' } })

    //   expect(instance.id).to.eq('1');
    //   expect(instance.books[0].temp_id).to.eq(null);
    //   expect(instance.books[0].genre.temp_id).to.eq(null);
    // });

    it("updates attributes with data from server", async () => {
      await instance.save({ with: { books: "genre" } })

      expect(instance.firstName).to.eq("first name from server")
      expect(instance.books[0].title).to.eq("title from server")
      expect(instance.books[0].genre.name).to.eq("name from server")
    })

    describe("when a hasMany relationship has no dirty members", () => {
      beforeEach(() => {
        instance.books[0] = new Book()
      })

      it("should not be sent in the payload", async () => {
        await instance.save({ with: { books: "genre" } })
        expect((<any>payloads)[0].data.relationships).to.eq(undefined)
      })
    })
  })

  describe("basic nested update", () => {
    beforeEach(() => {
      seedPersistedData()
    })

    it("sends the correct payload", async () => {
      await instance.save({ with: { books: "genre" } })

      expect(patchPayloads[0]).to.deep.equal(expectedUpdatePayload("update"))
    })
  })

  describe("basic nested destroy", () => {
    beforeEach(() => {
      seedPersistedData()
    })

    it("sends the correct payload", async () => {
      instance.books[0].isMarkedForDestruction = true
      instance.books[0].genre.isMarkedForDestruction = true
      await instance.save({ with: { books: "genre" } })

      expect(patchPayloads[0]).to.deep.equal(expectedUpdatePayload("destroy"))
    })

    it("removes the associated has_many data", async () => {
      instance.books[0].isMarkedForDestruction = true
      await instance.save({ with: "books" })

      expect(instance.books.length).to.eq(0)
    })

    it("removes the associated belongs_to data", async () => {
      instance.books[0].genre.isMarkedForDestruction = true
      await instance.save({ with: { books: "genre" } })

      expect(instance.books[0].genre).to.eq(undefined)
    })
  })

  describe("basic nested disassociate", () => {
    beforeEach(() => {
      seedPersistedData()
    })

    it("sends the correct payload", async () => {
      instance.books[0].isMarkedForDisassociation = true
      instance.books[0].genre.isMarkedForDisassociation = true
      await instance.save({ with: { books: "genre" } })

      expect(patchPayloads[0]).to.deep.equal(
        expectedUpdatePayload("disassociate")
      )
    })

    it("removes the associated has_many data", async () => {
      instance.books[0].isMarkedForDisassociation = true
      await instance.save({ with: "books" })

      expect(instance.books.length).to.eq(0)
    })

    it("removes the associated belongs_to data", async () => {
      instance.books[0].genre.isMarkedForDisassociation = true
      await instance.save({ with: { books: "genre" } })

      expect(instance.books[0].genre).to.eq(null)
    })
  })

  describe("when sideposting only id", () => {
    beforeEach(() => {
      let genre = new Genre({ id: 1 })
      genre.isPersisted = true
      genre.name = "Horror"
      let book = new Book({ id: 1, title: "The Shining", genre })
      book.isPersisted = true
      instance.books = [book]
    })

    describe("one level", () => {
      it("adds only resource identifier to the payload", async () => {
        await instance.save({ with: ["books.id"] })
        expect((<any>payloads)[0].data.relationships).to.deep.eq({
          books: {
            data: [
              {
                id: 1,
                method: "update",
                type: "books"
              }
            ]
          }
        })
        expect((<any>payloads)[0].included).to.deep.eq([
          {
            type: "books",
            id: 1
          }
        ])
      })
    })

    describe("2 levels only id", () => {
      it("sends only relationships, no attributes", async () => {
        await instance.save({ with: { ["books.id"]: "genre.id" } })

        expect((<any>payloads)[0].data.relationships).to.deep.eq({
          books: {
            data: [
              {
                id: 1,
                method: "update",
                type: "books"
              }
            ]
          }
        })

        expect((<any>payloads)[0].included).to.deep.eq([
          {
            id: 1,
            type: "books",
            relationships: {
              genre: {
                data: {
                  id: 1,
                  type: "genres",
                  method: "update"
                }
              }
            }
          },
          {
            id: 1,
            type: "genres"
          }
        ])
      })

      describe("when relationships are not dirty", () => {
        beforeEach(() => {
          instance.books[0].isPersisted = true
          instance.books[0].genre.isPersisted = true
        })

        it("still sends if id-only", async () => {
          await instance.save({ with: { ["books.id"]: "genre.id" } })
          expect((<any>payloads)[0].included).to.deep.eq([
            {
              id: 1,
              type: "books",
              relationships: {
                genre: {
                  data: {
                    id: 1,
                    type: "genres",
                    method: "update"
                  }
                }
              }
            },
            {
              id: 1,
              type: "genres"
            }
          ])
        })
      })
    })

    describe("one level id, then full payload", () => {
      it("should only send relationships in the payload", async () => {
        await instance.save({ with: { ["books.id"]: "genre" } })

        expect((<any>payloads)[0].included).to.deep.eq([
          {
            id: 1,
            type: "books",
            relationships: {
              genre: {
                data: {
                  id: 1,
                  type: "genres",
                  method: "update"
                }
              }
            }
          },
          {
            id: 1,
            type: "genres",
            attributes: { name: "Horror" }
          }
        ])
      })
    })
  })
})
