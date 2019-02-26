import {
  SpraypaintBase,
  Model,
  Attr,
  HasMany,
  HasOne,
  BelongsTo,
  Link
} from "../../lib-esm"
import { expect } from "chai"

describe("Decorators work with ES6/Babel", () => {
  describe("@Model()", () => {
    it("creates the models correctly", () => {
      @Model({})
      class ApplicationRecord extends SpraypaintBase {}

      @Model({ jsonapiType: "users" })
      class User extends ApplicationRecord {
        @Attr name
        @HasMany post
        @HasOne({ type: User }) supervisor
      }

      @Model({ jsonapiType: "posts" })
      class Post extends ApplicationRecord {
        @Attr title
        @BelongsTo author
      }

      @Model({ jsonapiType: "users_with_link" })
      class UserWithLink extends ApplicationRecord {
        @Attr name
        @Link self
      }

      expect(ApplicationRecord.parentClass).to.eq(SpraypaintBase)
      expect(ApplicationRecord.typeRegistry.get("users")).to.eq(User)
      expect(Object.keys(User.attributeList)).to.deep.eq([
        "name",
        "post",
        "supervisor"
      ])
      expect(Object.keys(Post.attributeList)).to.deep.eq(["title", "author"])
      expect(UserWithLink.linkList).to.deep.eq(["self"])
    })
  })
})
