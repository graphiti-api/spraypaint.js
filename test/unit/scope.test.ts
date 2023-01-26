import { expect, sinon } from "../test-helper"
import { Scope } from "../../src/scope"
import { Author, Book } from "../fixtures"
import { SpraypaintBase } from "../../src"

let scope: Scope<Author>

beforeEach(() => {
  const model = sinon.stub() as any
  model.jsonapiType = "people"
  model.serializeKey = SpraypaintBase.serializeKey
  model.keyCase = { server: "snake", client: "camel" }
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

    it("respects the server keycase configuration", () => {
      scope = scope.where({ fooBar: "baz" }).where({ fooBarBaz: "fooBar" })
      expect((scope as any)._filter).to.eql({
        foo_bar: "baz",
        foo_bar_baz: "fooBar"
      })
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

    it("respects the server keycase configuration", () => {
      scope = scope.stats({ someThing: "someOtherThing" })
      expect((scope as any)._stats).to.eql({
        some_thing: "some_other_thing"
      })
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

    it("respects the server keycase configuration", () => {
      scope = scope.order("fooBar").order({ fooBarBaz: "desc" })
      expect((scope as any)._sort).to.eql({
        foo_bar: "asc",
        foo_bar_baz: "desc"
      })
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

    it("respects the server keycase configuration", () => {
      scope = scope.select({ someThing: ["firstThing", "secondThing"] })
      expect((scope as any)._fields).to.eql({
        some_thing: ["first_thing", "second_thing"]
      })
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

    it("respects the server keycase configuration", () => {
      scope = scope.selectExtra({ someThing: ["firstThing", "secondThing"] })
      expect((scope as any)._extra_fields).to.eql({
        some_thing: ["first_thing", "second_thing"]
      })
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

      it("respects the server keycase configuration", () => {
        scope = scope.includes("fooBar")
        expect((scope as any)._include).to.eql({
          foo_bar: {}
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

      it("respects the server keycase configuration", () => {
        scope = scope.includes(["fooBar", "fooBarBaz"])
        expect((scope as any)._include).to.eql({
          foo_bar: {},
          foo_bar_baz: {}
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

      it("respects the server keycase configuration", () => {
        scope = scope.includes({
          fooBar: ["fooBarBaz", { fizzBuzz: "fizzBuzzBar" }]
        })
        expect((scope as any)._include).to.eql({
          foo_bar: {
            foo_bar_baz: {},
            fizz_buzz: {
              fizz_buzz_bar: {}
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

  describe("#merge()", () => {
    it("updates the scope", () => {
      scope = scope
        .includes(["foo_bar"])
        .merge({ foo_bar: scope.where({ foo: "bar" }) })
      const qp = scope.asQueryParams()

      expect(qp.filter).to.eql({
        foo_bar: {
          foo: "bar"
        }
      })
    })

    it("respects the server keycase configuration", () => {
      scope = scope
        .includes(["foo_bar_baz"])
        .merge({ fooBarBaz: scope.where({ foo: "bar" }) })
      const qp = scope.asQueryParams()

      expect(qp.filter).to.eql({
        foo_bar_baz: {
          foo: "bar"
        }
      })
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
        .where({ fooBar: "baz" })
        .order("foo")
        .order({ bar: "desc" })
        .select({ people: ["name", "age"] })
        .stats({ total: "count" })
        .includes({ a: ["b", { c: "d" }] })
      expect(scope.toQueryParams()).to.eq(
        "page[number]=2&page[size]=10&filter[foo_bar]=baz&sort=foo,-bar&fields[people]=name,age&stats[total]=count&include=a.b,a.c.d"
      )
    })

    it("correctly encodes special characters", () => {
      scope = scope.where({
        octothorp: "one # two",
        ampersand: "three & four"
      })
      expect(scope.toQueryParams()).to.eq(
        "filter[octothorp]=one%20%23%20two&filter[ampersand]=three%20%26%20four"
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
        expect(<string>scope.toQueryParams()).to.eq("foo=bar&bar=baz")
      })

      it("casts arrays correctly", () => {
        scope = scope.extraParams({ foo: "bar,baz" })
        expect(<string>scope.toQueryParams()).to.eq("foo=bar,baz")
      })

      it("casts objects correctly", () => {
        scope = scope.extraParams({ foo: { bar: "baz" } })
        expect(<string>scope.toQueryParams()).to.eq("foo[bar]=baz")
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

  describe("typings", () => {
    it("correctly compiles the types", () => {
      let authorScope: Scope<Author> = Author.scope()
      let genericScope: Scope<SpraypaintBase> = Author.scope()
    })
  })
})
