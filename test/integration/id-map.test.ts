import { expect, fetchMock, sinon } from "../test-helper"
import { ApplicationRecord, Author, Book, Bio } from "../fixtures"
import { IDMap } from "../../src/id-map"

afterEach(() => {
  ApplicationRecord.store.data = {}
})

let responsePayload = (firstName: string) => {
  return {
    data: {
      id: "1",
      type: "authors",
      attributes: { firstName }
    }
  }
}

describe("ID Map", () => {
  beforeEach(() => {
    ApplicationRecord.sync = true

    fetchMock.get(
      "http://example.com/api/v1/authors/1",
      responsePayload("John")
    )

    fetchMock.delete("http://example.com/api/v1/authors/1", {
      meta: {}
    })

    fetchMock.delete("http://example.com/api/books/1", {
      meta: {}
    })

    fetchMock.delete("http://example.com/api/bios/1", {
      meta: {}
    })
  })

  afterEach(() => {
    fetchMock.restore()
  })

  describe("when fetching from server", () => {
    describe("when disabled", () => {
      beforeEach(() => {
        ApplicationRecord.sync = false
      })

      it("does not add to the idmap", async () => {
        let { data } = await Author.find(1)
        let stored = ApplicationRecord.store.data
        expect(Object.keys(stored).length).to.eq(0)
      })
    })

    it("is added to the ID map", async () => {
      let { data } = await Author.find(1)
      let stored = ApplicationRecord.store.data
      expect(Object.keys(stored)[0]).to.eq("authors-1")
      expect(stored["authors-1"]).to.deep.eq(data.attributes)
    })

    it("syncs non-dirty attributes with id map", async () => {
      let author1 = (await Author.find(1)).data
      expect(author1.firstName).to.eq("John")

      fetchMock.restore()
      fetchMock.get(
        "http://example.com/api/v1/authors/1",
        responsePayload("Jane")
      )

      let author2 = (await Author.find(1)).data
      expect(author2.firstName).to.eq("Jane")
      expect(author1.firstName).to.eq("Jane")
    })

    it("does not see mark newly-synced attributes as dirty", async () => {
      let author1 = (await Author.find(1)).data
      expect(author1.firstName).to.eq("John")

      fetchMock.restore()
      fetchMock.get(
        "http://example.com/api/v1/authors/1",
        responsePayload("Jane")
      )

      await Author.find(1)
      expect(author1.firstName).to.eq("Jane")
      expect(author1.isDirty()).to.eq(false)
    })

    it("does not sync dirty attributes with id map", async () => {
      let author1 = (await Author.find(1)).data
      author1.firstName = "updated"

      fetchMock.restore()
      fetchMock.get(
        "http://example.com/api/v1/authors/1",
        responsePayload("Jane")
      )

      let author2 = (await Author.find(1)).data
      expect(author2.firstName).to.eq("Jane")
      expect(author1.firstName).to.eq("updated")
    })

    describe("when implementing afterSync hook", () => {
      it("fires after sync, passing changes as an argument", async() => {
        let author1 = (await Author.find(1)).data
        author1.afterSync = sinon.spy()

        fetchMock.restore()
        fetchMock.get(
          "http://example.com/api/v1/authors/1",
          responsePayload("Jane")
        )

        let author2 = (await Author.find(1)).data
        expect(author1.afterSync).to
          .have.been.calledWith({ firstName: ["John", "Jane"] })
      })

      describe("when store updates, but no changes", () => {
        it("does not fire the hook", async() => {
          let author1 = (await Author.find(1)).data
          author1.afterSync = sinon.spy()
          let author2 = (await Author.find(1)).data
          let called = (<any>author1.afterSync).called
          expect(called).to.eq(false)
        })
      })
    })

    describe("when syncing, then unlistening", () => {
      it("no longer syncs with id map", async () => {
        let author1 = (await Author.find(1)).data
        author1.firstName = "updated"
        author1.unlisten()
        let author2 = (await Author.find(1)).data
        expect(author1.firstName).to.eq("updated")
      })
    })

    // A good way to think about this test:
    //
    // On the one hand, we want instances to sync - imagine a page
    // that has a grid on the left, and a detail view on the right
    // when you click a grid record. Both should always reflect the
    // same global state.
    //
    // On the other hand, imagine that detail view was instead a form -
    // we wouldn't want the user typing in the form to update the grid,
    // until the form was saved.
    it("syncs multiple instances", async () => {
      fetchMock.patch("http://example.com/api/v1/authors/1", {
        data: {
          id: "1",
          type: "authors",
          attributes: {
            firstName: "updated"
          }
        }
      })

      let response = await Author.find(1)
      let author1 = response.data
      response = await Author.find(1)
      let author2 = response.data

      // not synced prior to save
      author1.firstName = "updated"
      expect(author2.firstName).to.not.eq("updated")

      await author1.save()

      // now synced after save
      expect(author2.firstName).to.eq("updated")

      // now back to unsynced
      author1.firstName = "updated again"
      expect(author2.firstName).to.eq("updated")
    })
  })

  describe("when updated", () => {
    beforeEach(() => {
      fetchMock.get("http://example.com/api/books/1", {
        data: {
          id: "1",
          type: "books",
          attributes: {
            title: "updated"
          }
        }
      })

      fetchMock.get("http://example.com/api/bios/1", {
        data: {
          id: "1",
          type: "bios",
          attributes: {
            description: "updated"
          }
        }
      })
    })

    describe("and associated to a hasMany relationship", () => {
      let book: Book
      let author: Author

      beforeEach(() => {
        book = new Book({ id: 1, title: "original" })
        book.isPersisted = true
        author = new Author({ id: 1, books: [book] })
      })

      it("is also updated within the relationship", async () => {
        expect(author.books[0].title).to.eq("original")
        let { data } = await Book.find(1)
        expect(data.title).to.eq("updated")
        expect(author.books[0].title).to.eq("updated")
      })
    })

    describe("and associated to a belongsTo relationship", () => {
      let book: Book
      let author: Author

      beforeEach(() => {
        author = new Author({ id: 1, firstName: "original" })
        author.isPersisted = true
        book = new Book({ id: 1, author })
        book.isPersisted = true
      })

      it("is also updated within the relationship", async () => {
        expect(book.author.firstName).to.eq("original")
        await Author.find(1)
        expect(book.author.firstName).to.eq("John")
      })
    })

    describe("and associated to a hasOne relationship", () => {
      let author: Author
      let bio: Bio

      beforeEach(() => {
        bio = new Bio({ id: 1, description: "original" })
        bio.isPersisted = true
        author = new Author({ id: 1, bio })
        author.isPersisted = true
      })

      it("is also updated within the relationship", async () => {
        expect(author.bio.description).to.eq("original")
        await Bio.find(1)
        expect(author.bio.description).to.eq("updated")
      })
    })
  })

  describe("when destroyed via sideposting", () => {
    beforeEach(async () => {
      fetchMock.patch("http://example.com/api/v1/authors/1", {
        data: {
          id: "1",
          type: "authors"
        }
      })

      fetchMock.patch("http://example.com/api/books/1", {
        data: {
          id: "1",
          type: "books"
        }
      })
    })

    describe("and associated to a hasMany relationship", () => {
      let author: Author
      let book: Book

      beforeEach(async () => {
        book = new Book({ id: 1 })
        book.isPersisted = true
        author = new Author({ id: 1, books: [book] })
        author.isPersisted = true
        book.isMarkedForDestruction = true
        await author.save({ with: "books" })
      })

      it("is removed from the ID map + relationship", async () => {
        expect(book.stale).to.eq(true)
        expect(ApplicationRecord.store.find(book)).to.eq(undefined)
        expect(author.books).to.deep.eq([])
      })
    })

    describe("and associated to a belongsTo relationship", () => {
      let author: Author
      let book: Book

      beforeEach(async () => {
        author = new Author({ id: 1 })
        author.isPersisted = true
        book = new Book({ id: 1, author })
        book.isPersisted = true
        author.isMarkedForDestruction = true
        await book.save({ with: "author" })
      })

      it("is removed from the ID map", async () => {
        expect(author.stale).to.eq(true)
        expect(ApplicationRecord.store.find(author)).to.eq(undefined)
        expect(book.author).to.eq(undefined)
      })
    })

    describe("and associated to a hasOne relationship", () => {
      let author: Author
      let bio: Bio

      beforeEach(async () => {
        bio = new Bio({ id: 1 })
        bio.isPersisted = true
        author = new Author({ id: 1, bio })
        author.isPersisted = true
        bio.isMarkedForDestruction = true
        await author.save({ with: "bio" })
      })

      it("is removed from the ID map", async () => {
        expect(bio.stale).to.eq(true)
        expect(ApplicationRecord.store.find(bio)).to.eq(undefined)
        expect(author.bio).to.eq(undefined)
      })
    })
  })

  describe("when disassociated via sideposting", () => {
    beforeEach(async () => {
      fetchMock.patch("http://example.com/api/v1/authors/1", {
        data: {
          id: "1",
          type: "authors"
        }
      })

      fetchMock.patch("http://example.com/api/books/1", {
        data: {
          id: "1",
          type: "books"
        }
      })
    })

    describe("and associated to a hasMany relationship", () => {
      let author: Author
      let book: Book

      beforeEach(async () => {
        book = new Book({ id: 1 })
        book.isPersisted = true
        author = new Author({ id: 1, books: [book] })
        author.isPersisted = true
        book.isMarkedForDisassociation = true
        await author.save({ with: "books" })
      })

      it("is still in the store, but removed from the relation", async () => {
        expect(book.stale).to.eq(false)
        expect(!!ApplicationRecord.store.find(book)).to.eq(true)
        expect(author.books).to.deep.eq([])
      })
    })

    describe("and associated to a belongsTo relationship", () => {
      let author: Author
      let book: Book

      beforeEach(async () => {
        author = new Author({ id: 1 })
        author.isPersisted = true
        book = new Book({ id: 1, author })
        book.isPersisted = true
        author.isMarkedForDisassociation = true
        ;(await book.save({ with: "author" }))
      })

      it("is still in the store, but removed from the relation", async () => {
        expect(author.stale).to.eq(false)
        expect(!!ApplicationRecord.store.find(author)).to.eq(true)
        expect(book.author).to.eq(null)
      })
    })

    describe("and associated to a hasOne relationship", () => {
      let author: Author
      let bio: Bio

      beforeEach(async () => {
        bio = new Bio({ id: 1 })
        bio.isPersisted = true
        author = new Author({ id: 1, bio })
        author.isPersisted = true
        bio.isMarkedForDisassociation = true
        await author.save({ with: "bio" })
      })

      it("is still in the store, but removed from the relation", async () => {
        expect(bio.stale).to.eq(false)
        expect(!!ApplicationRecord.store.find(bio)).to.eq(true)
        expect(author.bio).to.eq(null)
      })
    })
  })

  describe("when destroyed", () => {
    it("is removed from the ID map", async () => {
      let { data } = await Author.find(1)
      expect(ApplicationRecord.store.count).to.eq(1)
      await data.destroy()
      expect(ApplicationRecord.store.count).to.eq(0)
    })

    describe("and associated to a hasMany relationship", () => {
      let book: Book
      let author: Author

      beforeEach(() => {
        author = new Author({ id: 1 })
        author.isPersisted = true
        book = new Book({ id: 1 })
        book.isPersisted = true
        author.books = [book]
      })

      it("is no longer returned in the relationship", async () => {
        expect(author.books.length).to.eq(1)
        await book.destroy()
        expect(ApplicationRecord.store.find(book)).to.eq(undefined)
        expect(author.books.length).to.eq(0)
      })
    })

    describe("and associated to a belongsTo relationship", () => {
      let author: Author
      let book: Book

      beforeEach(() => {
        author = new Author({ id: 1 })
        author.isPersisted = true
        book = new Book({ author, id: 1 })
        book.isPersisted = true
      })

      it("is no longer returned in the relationship", async () => {
        expect(book.author).to.not.eq(undefined)
        await author.destroy()
        expect(book.author).to.eq(undefined)
      })
    })

    describe("and associated to a hasOne relationship", () => {
      let author: Author
      let bio: Bio

      beforeEach(() => {
        bio = new Bio({ id: 1 })
        bio.isPersisted = true
        author = new Author({ id: 1, bio })
        author.isPersisted = true
      })

      it("is no longer returned in the relationship", async () => {
        expect(author.bio).to.not.eq(undefined)
        await bio.destroy()
        expect(author.bio).to.eq(undefined)
      })
    })
  })
})
