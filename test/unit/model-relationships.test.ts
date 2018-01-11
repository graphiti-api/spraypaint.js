import { expect, sinon } from "../test-helper"
import { Author, Genre } from "../fixtures"

describe("Model relationships", () => {
  it("supports direct assignment of models", () => {
    const author = new Author()
    author.genre = new Genre({ name: "Horror" })
    expect(author.genre).to.be.instanceof(Genre)
    expect(author.genre.name).to.eq("Horror")
  })

  it("supports direct assignment of objects", () => {
    const author = new Author()
    author.genre = { name: "Horror" } as any
    expect(author.genre).to.be.instanceof(Genre)
    expect(author.genre.name).to.eq("Horror")
  })

  it("supports constructor assignment of models", () => {
    const genre = new Genre({ name: "Horror" })
    const author = new Author({ genre })
    expect(author.genre).to.be.instanceof(Genre)
    expect(author.genre.name).to.eq("Horror")
  })

  it("supports constructor assignment of objects", () => {
    const author = new Author({ genre: { name: "Horror" } })
    expect(author.genre).to.be.instanceof(Genre)
    expect(author.genre.name).to.eq("Horror")
  })

  it("defaults hasMany to empty collection", () => {
    const genre = new Genre()
    expect(genre.authors.length).to.eql(0)
  })

  it("has enumerable properties", () => {
    const genre = new Genre({ name: "Horror" })
    const author = new Author({ genre })
    const keys = Object.keys(author)

    expect(keys).to.include("genre")
  })
})
