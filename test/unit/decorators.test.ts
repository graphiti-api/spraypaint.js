import { expect } from "../test-helper"
import {
  Model,
  Attr,
  HasOne,
  HasMany,
  BelongsTo,
  initModel
} from "../../src/decorators"
import { Association } from "../../src/associations"
import { SpraypaintBase } from "../../src/model"

describe("Decorators", () => {
  describe("@Model", () => {
    const config = {
      apiNamespace: "api/v2",
      jsonapiType: "my_types",
      jwt: "abc123"
    }

    describe("class options", () => {
      let TestModel: typeof SpraypaintBase
      let BaseModel: typeof SpraypaintBase

      beforeEach(() => {
        @Model()
        class MyBase extends SpraypaintBase {}

        @Model(config)
        class MyModel extends MyBase {}

        TestModel = MyModel
        BaseModel = MyBase
      })

      it("preserves defaults for unspecified items", () => {
        expect(TestModel.baseUrl).to.eq("http://please-set-a-base-url.com")
        expect(TestModel.keyCase.server).to.eq("snake")
        expect(TestModel.keyCase.client).to.eq("camel")
      })

      it("correctly assigns options", () => {
        expect(TestModel.apiNamespace).to.eq(config.apiNamespace)
        expect(TestModel.jsonapiType).to.eq(config.jsonapiType)
        expect(TestModel.jwt).to.eq(config.jwt)
      })

      it("does not override parent class options", () => {
        expect(BaseModel.apiNamespace).not.to.eq(config.apiNamespace)
        expect(BaseModel.jsonapiType).not.to.eq(config.jsonapiType)
      })

      it("Overrides the parent class JWT",() => {
        expect(BaseModel.jwt).to.eq(config.jwt)
      })
    })

    describe("non-decorator syntax", () => {
      it("exports an initializer that can be applied directly to a SpraypaintBase-extended class", () => {
        class TestBase extends SpraypaintBase {}
        initModel(TestBase)

        class Person extends TestBase {}
        initModel(Person)

        expect(TestBase.currentClass).to.equal(TestBase)
        expect(TestBase.isBaseClass).to.be.true
        expect(Person.parentClass).to.equal(TestBase)
      })

      it("accepts config options", () => {
        class TestBase extends SpraypaintBase {}
        initModel(TestBase)

        class Person extends TestBase {}
        initModel(Person, config)

        expect(TestBase.currentClass).to.equal(TestBase)
        expect(TestBase.isBaseClass).to.be.true

        expect(Person.apiNamespace).to.eq(config.apiNamespace)
        expect(Person.jwt).to.eq(config.jwt)
        expect(Person.jsonapiType).to.eq(config.jsonapiType)
      })
    })
  })

  describe("@Attr", () => {
    let BaseModel: typeof SpraypaintBase

    beforeEach(() => {
      @Model()
      class MyBase extends SpraypaintBase {}
      BaseModel = MyBase
    })

    context("when used as a factory function", () => {
      it("allows type specification", () => {
        @Model()
        class TestClass extends BaseModel {
          @Attr({ type: String })
          testField!: string
        }

        expect(TestClass.attributeList.testField).to.include({
          persist: true,
          type: String,
          name: "testField"
        })
      })

      it("can be used without args", () => {
        @Model()
        class TestClass extends BaseModel {
          @Attr({ type: String })
          testField!: string
        }

        expect(TestClass.attributeList.testField).to.include({
          persist: true,
          type: String,
          name: "testField"
        })
      })
    })

    context("when used as raw decorator", () => {
      it("sets up the attribute correctly", () => {
        @Model()
        class TestClass extends BaseModel {
          @Attr testField!: string
        }

        expect(TestClass.attributeList.testField).to.include({
          persist: true,
          type: undefined,
          name: "testField"
        })
      })
    })

    context(
      "when used directly against a model without decorator syntax",
      () => {
        it("sets up the attribute correctly", () => {
          @Model()
          class TestClass extends BaseModel {}
          Attr(TestClass, "testField", { persist: false })

          expect(TestClass.attributeList.testField).to.include({
            persist: false,
            type: undefined,
            name: "testField"
          })
        })
      }
    )
  })

  const singleDecorators = [
    { Assoc: HasMany, Name: "@HasMany" },
    { Assoc: HasOne, Name: "@HasOne" },
    { Assoc: BelongsTo, Name: "@BelongsTo" }
  ]

  singleDecorators.forEach(({ Assoc, Name }) => {
    describe(Name, () => {
      let BaseModel: typeof SpraypaintBase
      let AssociationModel: typeof SpraypaintBase

      beforeEach(() => {
        @Model()
        class MyBase extends SpraypaintBase {}
        BaseModel = MyBase

        @Model({ jsonapiType: "test_associations" })
        class MyAssoc extends BaseModel {}
        AssociationModel = MyAssoc
      })

      context("when used as a factory function", () => {
        it("allows type to be provided as a class", () => {
          @Model()
          class TestClass extends BaseModel {
            @Assoc({ type: AssociationModel })
            testField: any
          }

          expect(TestClass.attributeList.testField).to.include({
            persist: true,
            type: AssociationModel,
            name: "testField"
          })
        })

        it("allows type to be provide as a jsonapi type", () => {
          @Model()
          class TestClass extends BaseModel {
            @Assoc({ type: "test_associations" })
            testField: any
          }

          expect(TestClass.attributeList.testField).to.include({
            persist: true,
            jsonapiType: "test_associations",
            name: "testField"
          })
        })

        it("allows a jsonapi type to be provided as a raw string", () => {
          @Model()
          class TestClass extends BaseModel {
            @Assoc("test_associations") testField: any
          }

          expect(TestClass.attributeList.testField).to.include({
            persist: true,
            jsonapiType: "test_associations",
            name: "testField"
          })
        })

        it("attempts to infer type if not specified", () => {
          @Model()
          class TestClass extends BaseModel {
            @Assoc() testAssociation: any
          }

          expect(TestClass.attributeList.testAssociation).to.include({
            persist: true,
            jsonapiType: "test_associations",
            name: "testAssociation"
          })
        })

        it("assigns the correct attribute owner", () => {
          @Model()
          class TestClass extends BaseModel {
            @Assoc() testAssociation: any
          }

          const assoc = TestClass.attributeList.testAssociation

          expect(assoc.owner).to.equal(TestClass)
        })
      })

      context("when used without decorator syntax", () => {
        it("allows the class, field, and options to be passed directly", () => {
          @Model()
          class TestClass extends BaseModel {}

          Assoc(TestClass, "testField", { type: AssociationModel })

          expect(TestClass.attributeList.testField).to.include({
            persist: true,
            type: AssociationModel,
            name: "testField"
          })
        })
      })
    })
  })

  describe("Attribute Decorator Factory", () => {
    xit("should have the ability to link third party decorators into object lifecycle", () => {
      //import { tracked } from '@glimmer/component'
      //let trackedAttr = decoratorFactory(tracked)
      @Model()
      class BaseModel extends SpraypaintBase {}

      @Model()
      class TestClass extends BaseModel {
        //@trackedAttr
        //@Attr name : string
      }
    })
  })
})
