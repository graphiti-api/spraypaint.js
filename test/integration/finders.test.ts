import { expect, fetchMock } from "../test-helper"
import { Person, Author, Book } from "../fixtures"
import { IResultProxy } from "../../src/proxies/index"

afterEach(() => {
  fetchMock.restore()
})

describe("Model finders", () => {
  describe("#find()", () => {
    beforeEach(() => {
      fetchMock.get("http://example.com/api/v1/people/1", {
        data: {
          id: "1",
          type: "people",
          attributes: {
            firstName: "John"
          }
        }
      })
    })

    it("allows for overridable fetch options", async () => {
      const dummyHeaders = { Test: "hi" }
      const { data } = await Person.extraFetchOptions({
        headers: dummyHeaders
      }).find(1)

      const defaultFetchOptions = Person.fetchOptions

      const lastOptions = fetchMock.lastOptions()

      expect(lastOptions.headers).to.deep.eq(dummyHeaders)
    })

    it("returns a promise that resolves the correct instance", async () => {
      const { data } = await Person.find(1)
      expect(data)
        .to.be.instanceof(Person)
        .and.have.property("id", "1")
    })

    it("assigns attributes correctly", async () => {
      const { data } = await Person.find(1)
      expect(data).to.have.property("firstName", "John")
    })

    describe("when API response returns a different type than the caller", () => {
      beforeEach(() => {
        fetchMock.restore()
        fetchMock.get("http://example.com/api/v1/people/1", {
          data: {
            id: "1",
            type: "authors"
          }
        })
      })

      it("resolves to the correct class", async () => {
        const { data } = await Person.find(1)

        expect(data).to.be.instanceof(Author)
      })
    })
  })

  describe("#first()", () => {
    describe("when call returns results", () => {
      beforeEach(() => {
        // NOTE: This limits to only one record
        fetchMock.get("http://example.com/api/v1/people?page[size]=1", {
          data: [
            {
              id: "1",
              type: "people"
            }
          ]
        })
      })

      it("returns a promise that resolves the correct instances", async () => {
        const { data } = await Person.first()

        expect(data)
          .to.be.instanceof(Person)
          .have.property("id", "1")
      })
    })

    describe("when call returns an empty array", () => {
      beforeEach(() => {
        // NOTE: This limits to only one record
        fetchMock.get("http://example.com/api/v1/people?page[size]=1", {
          data: [],
          meta: {
            foo: "bar"
          }
        })
      })

      it("returns a null record proxy", async () => {
        const { data } = await Person.first()

        expect(data).to.be.null
      })

      it("returns a record with all metadata", async () => {
        const { meta } = await Person.first()

        expect(meta).to.deep.equal({ foo: "bar" })
      })
    })
  })

  describe("#all()", () => {
    beforeEach(() => {
      fetchMock.restore()
      fetchMock.get("http://example.com/api/v1/people", {
        data: [{ id: "1", type: "people" }]
      })
    })

    it("returns a promise that resolves the correct instances", async () => {
      const { data } = await Person.all()

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
      expect(data[0]).to.have.property("id", "1")
    })

    describe("response includes a meta payload", () => {
      beforeEach(() => {
        fetchMock.restore()
        fetchMock.get("http://example.com/api/v1/people", {
          data: [{ id: "1", type: "people" }],
          meta: {
            stats: {
              total: {
                count: 45
              }
            }
          }
        })
      })

      it("includes meta payload in the resulting collection", async () => {
        const { meta } = await Person.all()

        expect(meta).to.have.nested.property("stats.total.count", 45)
      })
    })

    describe("when browser is IE", () => {
      beforeEach(() => {
        global["window"] = { navigator: { userAgent: "Trident" } }

        fetchMock.restore()
        fetchMock.get(
          "http://example.com/api/v1/people?filter[name]=%22Jane%22",
          {
            data: [
              {
                id: "13",
                type: "people",
                attributes: { firstName: "iespecial" }
              }
            ]
          }
        )
      })

      afterEach(() => {
        delete global["window"]
      })

      it("encodes URL", async () => {
        let people = (await Person.where({ name: '"Jane"' }).all()).data
        expect(people[0].firstName).to.eq("iespecial")
      })

      describe("when already encoded", () => {
        it("does not double-encode", async () => {
          const name = encodeURIComponent('"Jane"')
          let people = (await Person.where({ name }).all()).data
          expect(people[0].firstName).to.eq("iespecial")
        })
      })
    })
  })

  describe("#page", () => {
    beforeEach(() => {
      fetchMock.get("http://example.com/api/v1/people?page[number]=2", {
        data: [{ id: "2", type: "people" }]
      })
    })

    it("queries correctly", async () => {
      const { data } = await Person.page(2).all()

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
      expect(data[0]).to.have.property("id", "2")
    })

    describe("when merging association #page", () => {
      beforeEach(() => {
        fetchMock.reset()
        fetchMock.get(
          "http://example.com/api/v1/people?page[number]=5&page[books][number]=10",
          {
            data: [{ id: "1", type: "people" }]
          }
        )
      })

      it("queries correctly", async () => {
        const bookScope = Book.page(10)
        const personScope = Person.page(5).merge({ books: bookScope })
        const { data } = await personScope.all()

        expect(data.length).to.eq(1)
        expect(data[0]).to.be.instanceof(Person)
      })
    })
  })

  describe("#per", () => {
    beforeEach(() => {
      fetchMock.get("http://example.com/api/v1/authors?page[size]=5", {
        data: [{ id: "1", type: "authors" }]
      })
    })

    it("queries correctly", async () => {
      const { data } = await Author.per(5).all()

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
    })

    describe("when merging association #per", () => {
      beforeEach(() => {
        fetchMock.reset()
        fetchMock.get(
          "http://example.com/api/v1/people?page[size]=5&page[books][size]=2",
          {
            data: [{ id: "1", type: "people" }]
          }
        )
      })

      it("queries correctly", async () => {
        const bookScope = Book.per(2)
        const personScope = Person.per(5).merge({ books: bookScope })
        const { data } = await personScope.all()

        expect(data.length).to.eq(1)
        expect(data[0]).to.be.instanceof(Person)
      })
    })
  })

  describe("#order", () => {
    beforeEach(() => {
      fetchMock.get("http://example.com/api/v1/people?sort=foo,-bar", {
        data: [{ id: "2", type: "people" }]
      })
    })

    it("queries correctly", async () => {
      const { data } = await Person.order("foo")
        .order({ bar: "desc" })
        .all()

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
      expect(data[0]).to.have.property("id", "2")
    })

    describe("when merging association #order", () => {
      beforeEach(() => {
        fetchMock.reset()
        fetchMock.get(
          "http://example.com/api/v1/people?sort=foo,books.title,-books.pages",
          {
            data: [{ id: "2", type: "people" }]
          }
        )
      })

      it("queries correctly", async () => {
        const bookScope = Book.order("title").order({ pages: "desc" })
        let scope = Person.order("foo")
        scope = scope.merge({ books: bookScope })
        const { data } = await scope.all()

        expect(data.length).to.eq(1)
        expect(data[0]).to.be.instanceof(Person)
        expect(data[0]).to.have.property("id", "2")
      })
    })
  })

  describe("#where", () => {
    beforeEach(() => {
      fetchMock.get(
        "http://example.com/api/v1/people?filter[id]=2&filter[a]=b",
        {
          data: [{ id: "2", type: "people" }]
        }
      )
    })

    it("queries correctly", async () => {
      const { data } = await Person.where({ id: 2 })
        .where({ a: "b" })
        .all()

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
      expect(data[0]).to.have.property("id", "2")
    })

    describe("when value is an array", () => {
      beforeEach(() => {
        fetchMock.reset()
        fetchMock.get("http://example.com/api/v1/people?filter[id]=1,2,3", {
          data: [{ id: "2", type: "people" }]
        })
      })

      it("converts to comma-delimited string", async () => {
        const { data } = await Person.where({ id: [1, 2, 3] }).all()
        expect(data.length).to.eq(1)
      })
    })

    describe("when value is a nested hash", () => {
      beforeEach(() => {
        fetchMock.reset()
        fetchMock.get(
          "http://example.com/api/v1/people?filter[id][not_eq]=1,2,3",
          {
            data: [{ id: "2", type: "people" }]
          }
        )
      })

      it("converts to comma-delimited string", async () => {
        const { data } = await Person.where({
          id: {
            not_eq: [1, 2, 3]
          }
        }).all()
        expect(data.length).to.eq(1)
      })
    })

    describe("when value is false", () => {
      beforeEach(() => {
        fetchMock.reset()
        fetchMock.get(
          "http://example.com/api/v1/people?filter[id]=2&filter[a]=false",
          {
            data: [{ id: "2", type: "people" }]
          }
        )
      })

      it("still queries correctly", async () => {
        const { data } = await Person.where({ id: 2 })
          .where({ a: false })
          .all()

        expect(data.length).to.eq(1)
        expect(data[0]).to.be.instanceof(Person)
        expect(data[0]).to.have.property("id", "2")
      })
    })

    describe("when merging association #where", () => {
      beforeEach(() => {
        fetchMock.reset()
        fetchMock.get(
          "http://example.com/api/v1/people?filter[id]=1&filter[books][title]=It",
          {
            data: [{ id: "1", type: "people" }]
          }
        )
      })

      it("queries correctly", async () => {
        const bookScope = Book.where({ title: "It" })
        const personScope = Person.where({ id: 1 }).merge({ books: bookScope })

        const { data } = await personScope.all()

        expect(data.length).to.eq(1)
        expect(data[0]).to.be.instanceof(Person)
      })
    })
  })

  describe("#stats", () => {
    beforeEach(() => {
      fetchMock.get("http://example.com/api/v1/people?stats[total]=count,sum", {
        data: [{ id: "1", type: "people" }]
      })
    })

    it("queries correctly", async () => {
      const scope = Person.stats({ total: ["count", "sum"] })

      const { data } = await scope.all()

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
    })

    describe("when merging association #stats", () => {
      beforeEach(() => {
        fetchMock.reset()
        fetchMock.get(
          "http://example.com/api/v1/people?stats[total]=count,sum&stats[books][pages]=average",
          {
            data: [{ id: "1", type: "people" }]
          }
        )
      })

      it("queries correctly", async () => {
        const bookScope = Book.stats({ pages: ["average"] })
        let scope = Person.stats({ total: ["count", "sum"] })
        scope = scope.merge({ books: bookScope })

        const { data } = await scope.all()

        expect(data.length).to.eq(1)
        expect(data[0]).to.be.instanceof(Person)
      })
    })
  })

  describe("#select", () => {
    beforeEach(() => {
      fetchMock.get(
        "http://example.com/api/v1/people?fields[people]=name,age",
        {
          data: [{ id: "2", type: "people" }]
        }
      )
    })

    it("queries correctly", async () => {
      const { data } = await Person.select({ people: ["name", "age"] }).all()

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
      expect(data[0]).to.have.property("id", "2")
    })

    describe("when merging association #select", () => {
      describe("and primary data already has a #select", () => {
        beforeEach(() => {
          fetchMock.reset()
          fetchMock.get(
            "http://example.com/api/v1/people?fields[people]=first_name&fields[books]=title,foo",
            {
              data: [{ id: "1", type: "people" }]
            }
          )
        })

        it("queries correctly", async () => {
          const books = Book.select(["title", "foo"])
          const personScope = Person.select(["first_name"]).merge({ books })
          const { data } = await personScope.all()

          expect(data.length).to.eq(1)
          expect(data[0]).to.be.instanceof(Person)
        })
      })

      describe("and primary data does not already have a #select", () => {
        beforeEach(() => {
          fetchMock.reset()
          fetchMock.get(
            "http://example.com/api/v1/people?fields[books]=title,foo",
            {
              data: [{ id: "1", type: "people" }]
            }
          )
        })

        it("queries correctly", async () => {
          const books = Book.select(["title", "foo"])
          const personScope = Person.merge({ books })
          const { data } = await personScope.all()

          expect(data.length).to.eq(1)
          expect(data[0]).to.be.instanceof(Person)
        })
      })
    })
  })

  describe("#select_extra", () => {
    beforeEach(() => {
      fetchMock.get(
        "http://example.com/api/v1/people?extra_fields[people]=net_worth,best_friend",
        {
          data: [{ id: "2", type: "people" }]
        }
      )
    })

    it("queries correctly", async () => {
      const { data } = await Person.selectExtra({
        people: ["net_worth", "best_friend"]
      }).all()

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
      expect(data[0]).to.have.property("id", "2")
    })

    describe("when merging association #selectExtra", () => {
      describe("and primary data already has a #selectExtra", () => {
        beforeEach(() => {
          fetchMock.reset()
          fetchMock.get(
            "http://example.com/api/v1/people?extra_fields[people]=first_name&extra_fields[books]=title,foo",
            {
              data: [{ id: "1", type: "people" }]
            }
          )
        })

        it("queries correctly", async () => {
          const books = Book.selectExtra(["title", "foo"])
          const personScope = Person.selectExtra(["first_name"]).merge({
            books
          })
          const { data } = await personScope.all()

          expect(data.length).to.eq(1)
          expect(data[0]).to.be.instanceof(Person)
        })
      })

      describe("and primary data does not already have a #selectExtra", () => {
        beforeEach(() => {
          fetchMock.reset()
          fetchMock.get(
            "http://example.com/api/v1/people?extra_fields[books]=title,foo",
            {
              data: [{ id: "1", type: "people" }]
            }
          )
        })

        it("queries correctly", async () => {
          const books = Book.selectExtra(["title", "foo"])
          const personScope = Person.merge({ books })
          const { data } = await personScope.all()

          expect(data.length).to.eq(1)
          expect(data[0]).to.be.instanceof(Person)
        })
      })
    })
  })

  describe("#includes", () => {
    beforeEach(() => {
      fetchMock.get("http://example.com/api/v1/people?include=a.b,a.c.d", {
        data: [
          {
            id: "2",
            type: "people"
          }
        ]
      })
    })

    it("queries correctly", async () => {
      const { data } = await Person.includes({ a: ["b", { c: "d" }] }).all()

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
      expect(data[0]).to.have.property("id", "2")
    })
  })
})
