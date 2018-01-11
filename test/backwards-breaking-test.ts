import { sinon, expect } from "./test-helper"
import { Person, Author } from "./fixtures"
import { JSORMBase, Model, Attr } from "../src/index"

describe("Breaking changes", () => {
  describe(".extend() API", () => {
    const PlainJsClass = Person.extend({
      static: {
        classFunc() {
          return "from class"
        }
      },

      foo: "bar",
      bar() {
        return "baz"
      }
    })

    describe("Plain JS class", function() {
      it("supports instance props", function() {
        let instance = new PlainJsClass()
        expect(instance.foo).to.eq("bar")
      })

      it("supports instance methods", function() {
        let instance = new PlainJsClass()
        expect(instance.bar()).to.eq("baz")
      })

      it("supports class methods", function() {
        expect(PlainJsClass.classFunc()).to.eq("from class")
      })
    })
  })

  describe("Model Methods", () => {
    @Model()
    class BaseClass extends JSORMBase {}

    @Model()
    class TestClass extends BaseClass {
      @Attr name: string
    }

    let instance: TestClass

    beforeEach(() => {
      instance = new TestClass()
    })

    it("has a method for isPersisted", () => {
      expect(instance.isPersisted()).to.be.true
    })

    it("has a method for setting isPersisted", () => {
      expect(instance.isPersisted(true)).to.be.true
    })

    it("has a method for isMarkedForDestruction", () => {
      expect(instance.isMarkedForDestruction()).to.be.true
    })

    it("has a method for setting isMarkedForDestruction", () => {
      expect(instance.isMarkedForDestruction(true)).to.be.true
    })

    it("has a method for isMarkedForDisassociation", () => {
      expect(instance.isMarkedForDisassociation()).to.be.true
    })

    it("has a method for setting isMarkedForDisassociation", () => {
      expect(instance.isMarkedForDisassociation(true)).to.be.true
    })
  })
})
