import { expect, fetchMock } from "../test-helper"
import { Person, Author, Book } from "../fixtures"
import { IResultProxy } from "../../src/proxies/index"

after(() => {
  fetchMock.restore()
})

const resultData = <T>(promise: Promise<IResultProxy<T>>): Promise<any> => {
  return promise.then(proxyObject => {
    return proxyObject.data
  })
}

describe("Model finders", () => {
  describe("#find()", () => {
    before(() => {
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

    it("returns a promise that resolves the correct instance", async () => {
      const data = await resultData(Person.find(1))
      expect(data)
        .to.be.instanceof(Person)
        .and.have.property("id", "1")
    })

    it("assigns attributes correctly", async () => {
      const data = await resultData(Person.find(1))
      expect(data).to.have.property("firstName", "John")
    })

    describe("when API response returns a different type than the caller", () => {
      before(() => {
        fetchMock.restore()
        fetchMock.get("http://example.com/api/v1/people/1", {
          data: {
            id: "1",
            type: "authors"
          }
        })
      })

      it("resolves to the correct class", async () => {
        const result = await resultData(Person.find(1))

        expect(result).to.be.instanceof(Author)
      })
    })
  })

  describe("#first()", () => {
    before(() => {
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
      const result = await resultData(Person.first())

      expect(result)
        .to.be.instanceof(Person)
        .have.property("id", "1")
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
      const data = await resultData(Person.all())

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
        const result = await Person.all()

        expect(result).to.have.nested.property("meta.stats.total.count", 45)
      })
    })
  })

  describe("#page", () => {
    before(() => {
      fetchMock.get("http://example.com/api/v1/people?page[number]=2", {
        data: [{ id: "2", type: "people" }]
      })
    })

    it("queries correctly", async () => {
      const data = await resultData(Person.page(2).all())

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
      expect(data[0]).to.have.property("id", "2")
    })

    describe("when merging association #page", () => {
      before(() => {
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
        const data = await resultData(personScope.all())

        expect(data.length).to.eq(1)
        expect(data[0]).to.be.instanceof(Person)
      })
    })
  })

  describe("#per", () => {
    before(() => {
      fetchMock.get("http://example.com/api/v1/authors?page[size]=5", {
        data: [{ id: "1", type: "authors" }]
      })
    })

    it("queries correctly", async () => {
      const data = await resultData(Author.per(5).all())

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
    })

    describe("when merging association #per", () => {
      before(() => {
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
        const data = await resultData(personScope.all())

        expect(data.length).to.eq(1)
        expect(data[0]).to.be.instanceof(Person)
      })
    })
  })

  describe("#order", () => {
    before(() => {
      fetchMock.get("http://example.com/api/v1/people?sort=foo,-bar", {
        data: [{ id: "2", type: "people" }]
      })
    })

    it("queries correctly", async () => {
      const data = await resultData(
        Person.order("foo")
          .order({ bar: "desc" })
          .all()
      )

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
      expect(data[0]).to.have.property("id", "2")
    })

    describe("when merging association #order", () => {
      before(() => {
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
        const data = await resultData(scope.all())

        expect(data.length).to.eq(1)
        expect(data[0]).to.be.instanceof(Person)
        expect(data[0]).to.have.property("id", "2")
      })
    })
  })

  describe("#where", () => {
    before(() => {
      fetchMock.get(
        "http://example.com/api/v1/people?filter[id]=2&filter[a]=b",
        {
          data: [{ id: "2", type: "people" }]
        }
      )
    })

    it("queries correctly", async () => {
      const data = await resultData(
        Person.where({ id: 2 })
          .where({ a: "b" })
          .all()
      )

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
      expect(data[0]).to.have.property("id", "2")
    })

    describe("when value is false", () => {
      before(() => {
        fetchMock.reset()
        fetchMock.get(
          "http://example.com/api/v1/people?filter[id]=2&filter[a]=false",
          {
            data: [{ id: "2", type: "people" }]
          }
        )
      })

      it("still queries correctly", async () => {
        const data = await resultData(
          Person.where({ id: 2 })
            .where({ a: false })
            .all()
        )

        expect(data.length).to.eq(1)
        expect(data[0]).to.be.instanceof(Person)
        expect(data[0]).to.have.property("id", "2")
      })
    })

    describe("when merging association #where", () => {
      before(() => {
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

        const data = await resultData(personScope.all())

        expect(data.length).to.eq(1)
        expect(data[0]).to.be.instanceof(Person)
      })
    })
  })

  describe("#stats", () => {
    before(() => {
      fetchMock.get("http://example.com/api/v1/people?stats[total]=count,sum", {
        data: [{ id: "1", type: "people" }]
      })
    })

    it("queries correctly", async () => {
      const scope = Person.stats({ total: ["count", "sum"] })

      const data = await resultData(scope.all())

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
    })

    describe("when merging association #stats", () => {
      before(() => {
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

        const data = await resultData(scope.all())

        expect(data.length).to.eq(1)
        expect(data[0]).to.be.instanceof(Person)
      })
    })
  })

  describe("#select", () => {
    before(() => {
      fetchMock.get(
        "http://example.com/api/v1/people?fields[people]=name,age",
        {
          data: [{ id: "2", type: "people" }]
        }
      )
    })

    it("queries correctly", async () => {
      const data = await resultData(
        Person.select({ people: ["name", "age"] }).all()
      )

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
      expect(data[0]).to.have.property("id", "2")
    })
  })

  describe("#select_extra", () => {
    before(() => {
      fetchMock.get(
        "http://example.com/api/v1/people?extra_fields[people]=net_worth,best_friend",
        {
          data: [{ id: "2", type: "people" }]
        }
      )
    })

    it("queries correctly", async () => {
      const data = await resultData(
        Person.selectExtra({ people: ["net_worth", "best_friend"] }).all()
      )

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
      expect(data[0]).to.have.property("id", "2")
    })
  })

  describe("#includes", () => {
    before(() => {
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
      const data = await resultData(
        Person.includes({ a: ["b", { c: "d" }] }).all()
      )

      expect(data.length).to.eq(1)
      expect(data[0]).to.be.instanceof(Person)
      expect(data[0]).to.have.property("id", "2")
    })
  })
})
