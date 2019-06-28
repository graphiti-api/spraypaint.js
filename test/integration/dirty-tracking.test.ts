import { sinon, expect, fetchMock } from "../test-helper"
import { Person, Author, Book, Genre } from "../fixtures"
import { IResultProxy } from "../../src/proxies/index"

// This is a Vue-specific test. Since isPersisted is already true,
// Vue will prevent the setter from firing. We cannot rely on
// side-effect behavior of model.isPersisted = true
// So, ensure we at least call reset() explicitly
describe("Dirty tracking", () => {
  context("of attributes", () => {
    let responsePayload = (firstName: string) => {
      return {
        data: {
          id: "1",
          type: "people",
          attributes: { firstName }
        }
      }
    }

    afterEach(() => {
      fetchMock.restore()
    })

    beforeEach(() => {
      let url = "http://example.com/api/v1/authors"
      fetchMock.post(url, responsePayload("John"))
      fetchMock.patch(`${url}/1`, responsePayload("Jake"))
    })

    describe("when persisted, dirty, updated", () => {
      it("calls reset()", async () => {
        let instance = new Author({ firstName: "John" })
        await instance.save()
        expect(instance.isPersisted).to.eq(true)
        expect(instance.isDirty()).to.eq(false)
        instance.firstName = "Jake"
        expect(instance.isDirty()).to.eq(true)
        let spy = sinon.spy()
        instance.reset = spy
        await instance.save()
        expect(spy.callCount).to.eq(2)
      })
    })
  })

  context("of belongsTo relationships", () => {
    afterEach(() => {
      fetchMock.restore()
    })

    beforeEach(() => {
      fetchMock.get("http://example.com/api/v1/authors/1", {
        data: {
          id: "1",
          type: "authors",
          attributes: {
            firstName: "John"
          }
        }
      })
      fetchMock.get("http://example.com/api/genres/1", {
        data: {
          id: "1",
          type: "genres",
          attributes: {
            name: "Horror"
          }
        }
      })
    })

    describe("when assiciated", () => {
      it("isDirty() should be true", async () => {
        const { data: instance } = await Author.find(1)
        expect(instance.isDirty()).to.eq(false)
        const { data: genre } = await Genre.find(1)
        expect(genre.isDirty()).to.eq(false)

        instance.genre = genre
        expect(instance.isDirty()).to.eq(true)
      })
    })
  })
})
