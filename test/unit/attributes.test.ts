import { expect, sinon } from "../test-helper"
import { attr, Attribute } from "../../src/attribute"

describe("Attributes", () => {
  describe("Initializing Attribute", () => {
    it("accepts undefined options", () => {
      const anyAttr: Attribute<never> = attr()

      expect(anyAttr.type).to.eq(undefined)
    })

    it("accepts a primitive class as type", () => {
      const strAttr: Attribute<string> = attr({ type: String })

      expect(strAttr.type).to.eq(String)
    })

    it("accepts a custom class as type", () => {
      class Foo {}

      const fooAttr: Attribute<Foo> = attr({ type: Foo })

      expect(fooAttr.type).to.eq(Foo)
      it
    })

    it("defaults to persisted", () => {
      const defaultAttr = attr()
      expect(defaultAttr.persist).to.be.true
    })

    it("allows persistence to be overridden", () => {
      const defaultAttr = attr({ persist: false })
      expect(defaultAttr.persist).to.be.false
    })
  })
})
