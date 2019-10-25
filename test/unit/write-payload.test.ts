import { sinon, expect } from "../test-helper"
import { WritePayload } from "../../src/util/write-payload"
import { Person, PersonWithDasherizedKeys, Author, Genre } from "../fixtures"

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

  it("sends persisted relationship defined via direct assignment", () => {
    const genre = new Genre({ name: "Horror", id: "1" })
    genre.isPersisted = true
    const author = new Author()
    author.genre = genre
    const payload = new WritePayload(author, ["genre"])
    expect(payload.asJSON()).to.deep.equal({
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
    })
  })
})
