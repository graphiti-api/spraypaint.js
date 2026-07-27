import { expect, sinon } from "../test-helper"
import { Author, Book, Genre } from "../fixtures"

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

  it("supports constructor assignment of collections", () => {
    const author = new Author({
      books: [{ title: "The Shining" }, { title: "The Darkening" }]
    })
    expect(author.books.length).to.eq(2)
    expect(author.books[0]).to.be.instanceof(Book)
    expect(author.books[1]).to.be.instanceof(Book)
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

  it("supports self-referential relationships", () => {
    const genre = new Genre({ name: "Fantasy" })
    const subgenre = new Genre({
      name: "Sword and Sourcery",
      parentGenre: genre
    })

    expect(genre).to.be.instanceof(Genre)
    expect(subgenre).to.be.instanceof(Genre)
    expect(subgenre.parentGenre).to.be.instanceof(Genre)
  })
})
