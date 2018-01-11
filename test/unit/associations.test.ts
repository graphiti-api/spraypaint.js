import { expect, sinon } from "../test-helper"
import { JSORMBase } from "../../src/model"
import {
  hasMany,
  hasOne,
  belongsTo,
  HasMany,
  HasOne,
  BelongsTo
} from "../../src/associations"
import { Attribute } from "../../src/attribute"

class Employee extends JSORMBase {
  position = hasMany({ type: Positions })
}

class Positions extends JSORMBase {}

describe("Associations", () => {
  const singleDecorators = [
    { assoc: hasMany, Name: "hasMany", AssocClass: HasMany },
    { assoc: hasOne, Name: "hasOne", AssocClass: HasOne },
    { assoc: belongsTo, Name: "belongsTo", AssocClass: BelongsTo }
  ]
  singleDecorators.forEach(
    ({
      assoc,
      Name,
      AssocClass
    }: {
      assoc: any
      Name: string
      AssocClass: any
    }) => {
      describe(Name, () => {
        describe("Initializing Attribute", () => {
          it("accepts undefined options", () => {
            const defaultAssoc = assoc()

            expect(defaultAssoc.type).to.eq(undefined)
            expect(defaultAssoc).to.be.instanceOf(AssocClass)
          })

          it("accepts a jsormbase class as type", () => {
            class MyType extends JSORMBase {}

            const typeAssoc = assoc({ type: MyType })

            expect(typeAssoc.type).to.eq(MyType)
          })

          it("accepts a jsorm type string as type", () => {
            class MyType extends JSORMBase {}

            const jsonapiTypeAssoc = assoc({ type: "type_strings" })

            expect(jsonapiTypeAssoc.jsonapiType).to.eq("type_strings")
            it
          })

          it("accepts a bare jsorm type string", () => {
            class MyType extends JSORMBase {}

            const jsonapiTypeAssoc = assoc("type_strings")

            expect(jsonapiTypeAssoc.jsonapiType).to.eq("type_strings")
            it
          })

          it("defaults to persisted", () => {
            const defaultAttr = assoc()
            expect(defaultAttr.persist).to.be.true
          })

          it("allows persistence to be overridden", () => {
            const defaultAttr = assoc({ persist: false })
            expect(defaultAttr.persist).to.be.false
          })
        })
      })
    }
  )
})
