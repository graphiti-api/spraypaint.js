import { expect, sinon } from "../test-helper"
import { Scope } from "../../src/scope"
import { Author } from "../fixtures"

let scope: Scope<typeof Author>

beforeEach(() => {
  const model = sinon.stub() as any
  model.jsonapiType = "people"
  scope = new Scope(model)
})

describe("Scope", () => {
  describe("#page()", () => {
    it("sets correct pagination information", () => {
      scope = scope.page(2)
      expect((scope as any)._pagination).to.eql({ number: 2 })
    })

    it("returns a new scope", () => {
      const newScope = scope.page(2)
      expect(newScope).to.be.instanceof(Scope)
      expect(newScope).not.to.equal(scope)
    })
  })

  describe("#per()", () => {
    it("sets correct pagination information", () => {
      scope = scope.per(10)
      expect((scope as any)._pagination).to.eql({ size: 10 })
    })

    it("returns a new scope", () => {
      const newScope = scope.per(10)
      expect(newScope).to.be.instanceof(Scope)
      expect(newScope).not.to.equal(scope)
    })
  })

  describe("#where()", () => {
    it("updates filter criteria", () => {
      scope = scope
        .where({ foo: "bar" })
        .where({ bar: "baz" })
        .where({ foo: "bar2" })
      expect((scope as any)._filter).to.eql({
        foo: "bar2",
        bar: "baz"
      })
    })

    it("returns a new scope", () => {
      const newScope = scope.where({ foo: "bar" })
      expect(newScope).to.be.instanceof(Scope)
      expect(newScope).not.to.equal(scope)
    })
  })

  describe("#stats()", () => {
    it("updates stats request", () => {
      scope = scope.stats({ total: "count" }).stats({ average: "cost" })

      expect((scope as any)._stats).to.eql({
        total: "count",
        average: "cost"
      })
    })

    it("returns a new scope", () => {
      const newScope = scope.stats({ total: "count" })
      expect(newScope).to.be.instanceof(Scope)
      expect(newScope).not.to.equal(scope)
    })
  })

  describe("#order()", () => {
    it("updates sort criteria", () => {
      scope = scope.order("foo").order({ bar: "desc" })
      expect((scope as any)._sort).to.eql({
        foo: "asc",
        bar: "desc"
      })
    })

    it("returns a new scope", () => {
      const newScope = scope.order("foo")
      expect(newScope).to.be.instanceof(Scope)
      expect(newScope).not.to.equal(scope)
    })
  })

  describe("#select()", () => {
    it("updates fields criteria", () => {
      scope = scope
        .select({ people: ["foo", "bar"] })
        .select({ things: ["baz"] })
      expect((scope as any)._fields).to.eql({
        people: ["foo", "bar"],
        things: ["baz"]
      })
    })

    it("returns a new scope", () => {
      const newScope = scope.select({ people: ["foo"] })
      expect(newScope).to.be.instanceof(Scope)
      expect(newScope).not.to.equal(scope)
    })

    describe("when passed an array of strings", () => {
      it("infers the jsonapi type", () => {
        const newScope = scope.select(["foo"])
        expect((newScope as any)._fields).to.eql({
          people: ["foo"]
        })
      })
    })
  })

  describe("#selectExtra()", () => {
    it("updates fields criteria", () => {
      scope = scope
        .selectExtra({ people: ["foo", "bar"] })
        .selectExtra({ things: ["baz"] })
      expect((scope as any)._extra_fields).to.eql({
        people: ["foo", "bar"],
        things: ["baz"]
      })
    })

    it("returns a new scope", () => {
      const newScope = scope.selectExtra({ people: ["foo"] })
      expect(newScope).to.be.instanceof(Scope)
      expect(newScope).not.to.equal(scope)
    })

    describe("when passed an array of strings", () => {
      it("infers the jsonapi type", () => {
        const newScope = scope.selectExtra(["foo"])
        expect((newScope as any)._extra_fields).to.eql({
          people: ["foo"]
        })
      })
    })
  })

  describe("#includes()", () => {
    describe("when passed a string", () => {
      it("updates include criteria", () => {
        scope = scope.includes("foo")
        expect((scope as any)._include).to.eql({
          foo: {}
        })
      })
    })

    describe("when passed an array", () => {
      it("updates include criteria", () => {
        scope = scope.includes(["foo", "bar"])
        expect((scope as any)._include).to.eql({
          foo: {},
          bar: {}
        })
      })
    })

    describe("when passed a nested object", () => {
      it("updates include criteria", () => {
        scope = scope.includes({ a: ["b", { c: "d" }] })
        expect((scope as any)._include).to.eql({
          a: {
            b: {},
            c: {
              d: {}
            }
          }
        })
      })
    })

    it("returns a new scope", () => {
      const newScope = scope.includes("foo")
      expect(newScope).to.be.instanceof(Scope)
      expect(newScope).not.to.equal(scope)
    })
  })

  describe("#scope()", () => {
    it("returns itself", () => {
      expect(scope.scope()).to.equal(scope)
    })
  })

  describe("#asQueryParams()", () => {
    it("transforms all scoping criteria into a jsonapi-compatible query param object", () => {
      scope = scope
        .page(2)
        .per(10)
        .where({ foo: "bar" })
        .where({ bar: "baz" })
        .order("foo")
        .order({ bar: "desc" })
        .select({ people: ["name", "age"] })
        .select({ pets: ["type"] })
        .selectExtra({ people: ["net_worth"] })
        .stats({ total: "count" })
        .extraParams({ foo: "bar" })
        .includes({ a: ["b", { c: "d" }] })
      const qp = scope.asQueryParams()

      expect(qp).to.eql({
        page: {
          size: 10,
          number: 2
        },
        filter: {
          bar: "baz",
          foo: "bar"
        },
        sort: ["foo", "-bar"],
        fields: {
          people: ["name", "age"],
          pets: ["type"]
        },
        extra_fields: {
          people: ["net_worth"]
        },
        stats: {
          total: "count"
        },
        foo: "bar",
        include: "a.b,a.c.d"
      })
    })
  })

  describe("#toQueryParams", () => {
    it("transforms nested query parameter object to query string", () => {
      scope = scope
        .page(2)
        .per(10)
        .where({ foo: "bar" })
        .order("foo")
        .order({ bar: "desc" })
        .select({ people: ["name", "age"] })
        .stats({ total: "count" })
        .includes({ a: ["b", { c: "d" }] })
      expect(scope.toQueryParams()).to.eq(
        "page[number]=2&page[size]=10&filter[foo]=bar&sort=foo,-bar&fields[people]=name,age&stats[total]=count&include=a.b,a.c.d"
      )
    })

    it("does not include empty objects", () => {
      scope = scope.page(2)
      expect((<string>scope.toQueryParams()).match(/field/) === null).to.eq(
        true
      )
    })

    describe("when no scoping criteria present", () => {
      it("returns undefined", () => {
        expect(scope.toQueryParams()).to.eq(undefined)
      })
    })

    describe("when arbitrary query params added", () => {
      it("adds to the param string", () => {
        scope = scope.extraParams({ foo: "bar", bar: "baz" })
        expect((<string>scope.toQueryParams())).to.eq("foo=bar&bar=baz")
      })

      it("casts arrays correctly", () => {
        scope = scope.extraParams({ foo: "bar,baz" })
        expect((<string>scope.toQueryParams())).to.eq("foo=bar,baz")
      })

      it("casts objects correctly", () => {
        scope = scope.extraParams({ foo: { bar: "baz" } })
        expect((<string>scope.toQueryParams())).to.eq("foo[bar]=baz")
      })
    })
  })

  describe("#copy", () => {
    it("should make a copy of the scope", () => {
      expect(scope.copy()).not.to.eq(scope)
    })

    it("should make a copy of scope attributes", () => {
      const original: any = scope
        .order({ foo: "asc" })
        .page(1)
        .per(20)

      const copy = original.copy()

      expect(original._pagination).not.to.eq(copy._pagination)
      expect(original._pagination).to.deep.eq(copy._pagination)

      expect(original._sort).not.to.eq(copy._sort)
      expect(original._sort).to.deep.eq(copy._sort)
    })
  })
})
