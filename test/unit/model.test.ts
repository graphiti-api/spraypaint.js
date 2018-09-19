import { expect, sinon } from "../test-helper"
import { SinonSpy, SinonStub } from "sinon"
import { SpraypaintBase } from "../../src/model"
import { hasOne } from "../../src/associations"
import { attr } from "../../src/attribute"
import { JsonapiTypeRegistry } from "../../src/jsonapi-type-registry"
import { StorageBackend, InMemoryStorageBackend, CredentialStorage } from "../../src/credential-storage"
import { JsonapiResource, JsonapiResponseDoc } from "../../src/index"
import { EventBus } from "../../src/event-bus"

import {
  ApplicationRecord,
  Person,
  Book,
  Author,
  Genre,
  Bio
} from "../fixtures"

import { Model, Attr, HasOne, HasMany, BelongsTo } from "../../src/decorators"
import { eq } from 'lodash-es';

// Accessing private property in unit tests so we need a type-loose conversion function
const modelAttrs = (model: SpraypaintBase): Record<string, any> =>
  (<any>model)._attributes

describe("Model", () => {
  beforeEach(() => {
    SpraypaintBase.initializeCredentialStorage()
  })
  describe("Class Creation/Initialization", () => {
    describe("Typescript Classes + Decorators API", () => {
      describe("Base Class", () => {
        let BaseClass: typeof SpraypaintBase
        let SubClass: typeof SpraypaintBase

        beforeEach(() => {
          @Model()
          class TestBase extends SpraypaintBase {}
          BaseClass = TestBase

          @Model()
          class ChildModel extends BaseClass {}
          SubClass = ChildModel
        })

        it("creates a new model types registry", () => {
          expect((<any>SpraypaintBase)._typeRegistry).to.be.undefined
          expect(BaseClass.typeRegistry).to.be.instanceOf(JsonapiTypeRegistry)
        })

        it("sets the model as a new base class", () => {
          expect(BaseClass.isBaseClass).to.be.true
          expect(BaseClass.baseClass).to.eq(BaseClass)
        })

        it("allows child classes to get a reference to their base", () => {
          expect(SubClass.isBaseClass).to.be.false
          expect(SubClass.baseClass).to.eq(BaseClass)
        })

        describe('#credentialStorage', () => {
          let originalStore : CredentialStorage

          beforeEach(() => {
            originalStore = (SpraypaintBase as any)._credentialStorage
          })

          afterEach(() => {
            ;(SpraypaintBase as any)._credentialStorage = originalStore
          })

          context('localStorage API is present', () => {
            let localStorageStub: {
              getItem: SinonSpy
              setItem: SinonSpy
              removeItem: SinonSpy
            }
            let originalStorage : any

            beforeEach(() => {
              localStorageStub = {
                getItem: sinon.spy(),
                setItem: sinon.spy(),
                removeItem: sinon.spy(),
              }

              if (typeof localStorage !== 'undefined') {
                originalStorage = localStorage
              }
              ;(global as any).localStorage = localStorageStub
              SpraypaintBase.initializeCredentialStorage()
            })

            afterEach(() => {
              ;(global as any).localStorage = originalStorage
              SpraypaintBase.initializeCredentialStorage()
            })

            it('defaults to use localStorage', () => {
              expect(SpraypaintBase.credentialStorageBackend).to.eq(localStorageStub)
            })
          })

          context('localStorage API is not defined', () => {
            let originalStorage : any

            beforeEach(() => {
              if (typeof localStorage !== 'undefined') {
                originalStorage = localStorage
                ;(localStorage as any) = undefined
              }
            })

            afterEach(() => {
              if (originalStorage) {
                localStorage = originalStorage
              }
            })

            it('defaults an in-memory store', () => {
              SpraypaintBase.initializeCredentialStorage()
              expect(SpraypaintBase.credentialStorageBackend).to.be.instanceOf(InMemoryStorageBackend)
            })
          })

          describe('Assigning credential storage backend', () => {
            it('re-initializes the credential store with the new backend', () => {
              let backend = {} as any
              SpraypaintBase.credentialStorageBackend = backend

              expect(SpraypaintBase.credentialStorage).not.to.eq(originalStore)
              expect((SpraypaintBase.credentialStorage as any)._backend).to.eq(backend)
            })
          })
        })

        describe('JWT Persistence', () => {
          beforeEach(() => {
            BaseClass.credentialStorageBackend = new InMemoryStorageBackend()
          })

          describe("#getJWT", () => {
            beforeEach(() => {
              BaseClass.jwt = "g3tm3"
            })

            it("it grabs jwt from top-most parent", () => {
              expect(SubClass.getJWT()).to.eq("g3tm3")
            })

            describe("when JWT storage is disabled", () => {
              it("returns undefined", () => {
                @Model({
                  jwtStorage: false
                })
                class NoJWT extends SpraypaintBase {}
                expect(NoJWT.getJWT()).to.eq(undefined)
              })
            })
          })

          describe("#setJWT", () => {
            it("it sets jwt on the base class", () => {
              SubClass.setJWT("n3wt0k3n")
              expect(BaseClass.jwt).to.eq("n3wt0k3n")
            })

            describe("when credentialStorage is configured", () => {
              let backend: StorageBackend
              const buildModel = () => {
                // need new class for this since it needs initialization to have the jwt config set
                @Model({
                  jwtStorage: "MyJWT",
                })
                class Base extends SpraypaintBase {}
                BaseClass = Base

                BaseClass.credentialStorageBackend = backend
              }

              describe("JWT Updates", () => {
                beforeEach(() => {
                  backend = new InMemoryStorageBackend()

                  buildModel()
                })

                it("adds to credentialStorage", () => {
                  BaseClass.setJWT("n3wt0k3n")
                  expect(backend.getItem('MyJWT')).to.eq("n3wt0k3n")
                })

                context("when new token is undefined", () => {
                  it("correctly clears the token", () => {
                    BaseClass.setJWT(undefined)
                    expect(backend.getItem('MyJWT')).be.null
                  })
                })
              })

              describe("JWT Initialization", () => {
                beforeEach(() => {
                  backend = new InMemoryStorageBackend()
                  backend.setItem('MyJWT', "or!g!nalt0k3n")

                  buildModel()
                })

                it("sets the token correctly", () => {
                  expect(BaseClass.getJWT()).to.equal("or!g!nalt0k3n")
                })

                it("does not set it on the base class or other sibling classes", () => {
                  expect(SpraypaintBase.getJWT()).to.equal(undefined)
                  expect(ApplicationRecord.getJWT()).to.equal(undefined)
                })
              })
            })
          })
        })
      })

      @Model()
      class BaseModel extends SpraypaintBase {}

      @Model()
      class Post extends BaseModel {
        @Attr title!: string
        @BelongsTo({ type: Person })
        author!: Person

        screamTitle(exclamationPoints: number): string {
          let loudness: string = ""

          for (let i = 0; i < exclamationPoints; i++) {
            loudness += "!"
          }

          return `${this.title.toUpperCase()}${loudness}`
        }
      }

      it("sets up expected inheritance hierarchy", () => {
        expect(Post.currentClass).to.equal(Post)
        expect(Post.parentClass).to.equal(BaseModel)
        expect(Post.isBaseClass).to.be.false
        const instance = new Post()

        expect((<any>instance).klass).to.eq(Post)
      })

      it("sets a default jsonapi type", () => {
        @Model()
        class TestType extends BaseModel {}

        expect(TestType.jsonapiType).to.eq("test_types")
      })

      it("obeys explicit jsonapi type", () => {
        @Model({ jsonapiType: "my_type" })
        class TestType extends BaseModel {}

        expect(TestType.jsonapiType).to.eq("my_type")
      })

      it("adds the instance to the type registry", () => {
        expect(BaseModel.typeRegistry.get("posts")).to.equal(Post)
      })

      it("correctly instantiates the model", () => {
        const theAuthor = new Person()
        const post = new Post({
          title: "The Title",
          author: theAuthor,
          id: "1234"
        })

        expect(post.author).to.equal(theAuthor)
        expect(post.screamTitle(3)).to.equal("THE TITLE!!!")
        expect(post.id).to.equal("1234")
      })

      it("sets up attribute getters/setters", () => {
        const post = new Post({ title: "The Title" })

        expect(modelAttrs(post)).to.deep.equal({
          title: "The Title"
        })

        post.title = "new title"

        expect(modelAttrs(post)).to.deep.equal({
          title: "new title"
        })
        expect(post.screamTitle(3)).to.equal("NEW TITLE!!!")
      })

      describe("model inheritence", () => {
        @Model()
        class FrontPagePost extends Post {
          @Attr() pageOrder!: number

          isFirst() {
            return this.pageOrder === 1
          }
        }

        it("sets up expected inheritance hierarchy", () => {
          expect(FrontPagePost.currentClass).to.equal(FrontPagePost)
          expect(FrontPagePost.parentClass).to.equal(Post)
          expect(FrontPagePost.isBaseClass).to.be.false
          const instance = new FrontPagePost()

          expect((<any>instance).klass).to.eq(FrontPagePost)
        })

        it("allows extension of the model", () => {
          const post = new FrontPagePost({ title: "The Title", pageOrder: 1 })

          expect(post.screamTitle(3)).to.equal("THE TITLE!!!")
          expect(post.isFirst()).to.be.true
        })

        it("does not modify the parent attributes", () => {
          const post = new Post({ title: "The Title", pageOrder: 1 })

          expect(modelAttrs(post).pageOrder).to.be.undefined
        })
      })

      describe("model inheritence with .extends() API", () => {
        const FrontPagePost = Post.extend({
          attrs: {
            pageOrder: attr({ type: Number })
          },
          methods: {
            isFirst() {
              return this.pageOrder === 1
            }
          }
        })

        it("allows extension of the model", () => {
          const post = new FrontPagePost({ title: "The Title", pageOrder: 1 })

          expect(post.screamTitle(3)).to.equal("THE TITLE!!!")
          expect(post.isFirst()).to.be.true
        })
      })
    })

    describe(".extend() API", () => {
      const BaseModel = SpraypaintBase.extend({})

      const Human = BaseModel.extend({
        attrs: {
          name: attr({ type: String })
        }
      })

      const Post = BaseModel.extend({
        static: {
          jsonapiType: "posts"
        },
        attrs: {
          title: attr({ type: String }),
          author: hasOne({ type: Human })
        },
        methods: {
          screamTitle(exclamationPoints: number): string {
            let loudness: string = ""

            for (let i = 0; i < exclamationPoints; i++) {
              loudness += "!"
            }

            return `${this.title.toUpperCase()}${loudness}`
          },
          other(): boolean {
            return true
          }
        }
      })

      it("sets up expected inheritance hierarchy", () => {
        expect(Post.currentClass).to.equal(Post)
        expect(Post.parentClass).to.equal(BaseModel)
        expect(Post.isBaseClass).to.be.false
        const instance = new Post()

        expect((<any>instance).klass).to.eq(Post)
      })

      it("obeys explicit jsonapi type", () => {
        expect(Post.jsonapiType).to.eq("posts")
      })

      it("adds the instance to the type registry", () => {
        expect(BaseModel.typeRegistry.get("posts")).to.equal(Post)
      })

      it("correctly instantiates the model", () => {
        const theAuthor = new Human({ name: "fred" })
        const post = new Post({
          title: "The Title",
          author: theAuthor,
          id: "1234"
        })

        expect(post.author).to.equal(theAuthor)
        expect(post.screamTitle(3)).to.equal("THE TITLE!!!")
        expect(post.id).to.equal("1234")
      })

      it("sets up attribute getters/setters", () => {
        const post = new Post({ title: "The Title" })

        expect(modelAttrs(post)).to.deep.equal({
          title: "The Title"
        })

        post.title = "new title"

        expect(modelAttrs(post)).to.deep.equal({
          title: "new title"
        })
        expect(post.screamTitle(3)).to.equal("NEW TITLE!!!")
      })

      describe("model inheritence", () => {
        const FrontPagePost = Post.extend({
          attrs: {
            pageOrder: attr({ type: Number })
          },
          methods: {
            isFirst() {
              return this.pageOrder === 1
            }
          }
        })

        it("sets up expected inheritance hierarchy", () => {
          expect(FrontPagePost.currentClass).to.equal(FrontPagePost)
          expect(FrontPagePost.parentClass).to.equal(Post)
          expect(Post.isBaseClass).to.be.false
          const instance = new FrontPagePost()

          expect((<any>instance).klass).to.eq(FrontPagePost)
        })

        it("allows extension of the model", () => {
          const post = new FrontPagePost({ title: "The Title", pageOrder: 1 })

          expect(post.screamTitle(3)).to.equal("THE TITLE!!!")
          expect(post.isFirst()).to.be.true
        })

        it("does not modify the parent attributes", () => {
          const post = new Post({ title: "The Title", pageOrder: 1 })

          expect(modelAttrs(post).pageOrder).to.be.undefined
        })
      })

      /*
       *
       * While the underlying javascript functions correctly, the
       * current type definitions for the SpraypaintBase.extend() API
       * don't allow for declaring a typescript class based on a
       * class created from extend().  This was originally working,
       * but the type definitions were VERY complicated, and in
       * simplifying them, it was necessary to omit the case
       * where one was going FROM javascript TO typescript,
       * which seems like a far edge case when there aren't any
       * type definitions exported by the library as well, so I'm
       * punting on it for now until I figure out a typings fix.
       *
       * Keeping the tests around with a lot of coercion to verify
       * the underlying functionality still works from a JS-only
       * perspective.
       *
       */
      describe("inheritance with class-based declaration", () => {
        class ExtendedPost extends (<any>Post) {
          // @Attr pageOrder : number
          pageOrder!: number

          isFirst() {
            return this.pageOrder === 1
          }
        }
        Model(ExtendedPost as any)
        Attr(ExtendedPost as any, "pageOrder")
        const FrontPagePost: any = ExtendedPost

        it("allows extension of the model", () => {
          const post = new FrontPagePost({ title: "The Title", pageOrder: 1 })

          expect(post.screamTitle(3)).to.equal("THE TITLE!!!")
          expect(post.isFirst()).to.be.true
        })

        it("does not modify the parent attributes", () => {
          const post = new Post({ title: "The Title", pageOrder: 1 })

          expect(modelAttrs(post).pageOrder).to.be.undefined
        })
      })

      describe("class options", () => {
        const config = {
          apiNamespace: "api/v1",
          jwtStorage: 'foobarJWT',
          jwt: "abc123",
        }
        let MyModel : typeof SpraypaintBase
        let originalStore : StorageBackend

        beforeEach(() => {
          originalStore = BaseModel.credentialStorage.backend
          BaseModel.credentialStorageBackend = new InMemoryStorageBackend()

          MyModel = BaseModel.extend({
            static: config
          })
        })

        afterEach(() => {
          BaseModel.credentialStorageBackend = originalStore
        })

        it("preserves defaults for unspecified items", () => {
          expect(MyModel.baseUrl).to.eq("http://please-set-a-base-url.com")
          expect(MyModel.keyCase.server).to.eq("snake")
          expect(MyModel.keyCase.client).to.eq("camel")
        })

        it("correctly assigns options", () => {
          expect(MyModel.apiNamespace).to.eq(config.apiNamespace)
          expect(MyModel.jwt).to.eq(config.jwt)
        })

        it("does not override parent class options", () => {
          expect(BaseModel.apiNamespace).not.to.eq(config.apiNamespace)
        })
      })
    })

    describe("Instance Behavior", () => {
      describe("isMarkedForDestruction", () => {
        it("toggles correctly", () => {
          const instance = new Author()
          expect(instance.isMarkedForDestruction).to.eq(false)
          instance.isMarkedForDestruction = true
          expect(instance.isMarkedForDestruction).to.eq(true)
          instance.isMarkedForDestruction = false
          expect(instance.isMarkedForDestruction).to.eq(false)
        })
      })

      describe("isMarkedForDisassociation", () => {
        it("toggles correctly", () => {
          const instance = new Author()
          expect(instance.isMarkedForDisassociation).to.eq(false)
          instance.isMarkedForDisassociation = true
          expect(instance.isMarkedForDisassociation).to.eq(true)
          instance.isMarkedForDisassociation = false
          expect(instance.isMarkedForDisassociation).to.eq(false)
        })
      })

      describe("#isType", () => {
        it("checks the jsonapiType of class", () => {
          const instance = new Author()
          expect(instance.isType("authors")).to.eq(true)
          expect(instance.isType("people")).to.eq(false)
        })
      })
    })
  })

  describe("#fromJsonapi", () => {
    const doc = {
      data: {
        id: "1",
        type: "authors",
        attributes: {
          firstName: "Donald Budge",
          unknown: "adsf",
          nilly: null
        },
        relationships: {
          unknownrelationship: {
            data: {
              id: "1",
              type: "unknowns"
            }
          },
          multi_words: {
            data: [
              {
                id: "1",
                type: "multi_words"
              }
            ]
          },
          tags: {},
          genre: {
            data: {
              id: "1",
              type: "genres"
            }
          },
          books: {
            data: [
              {
                id: "1",
                type: "books"
              },
              {
                id: "2",
                type: "books"
              }
            ]
          },
          special_books: {
            data: [
              {
                id: "3",
                type: "books"
              }
            ]
          },
          bio: {
            data: {
              id: "1",
              type: "bios"
            }
          }
        },
        meta: {
          big: true
        }
      },
      included: [
        {
          type: "books",
          id: "1",
          attributes: {
            title: "Where's My Butt?"
          },
          relationships: {
            author: {
              data: {
                id: "2",
                type: "authors"
              }
            }
          }
        },
        {
          type: "books",
          id: "2",
          attributes: {
            title: "Catcher in the Rye"
          },
          relationships: {
            author: {
              data: {
                id: "2",
                type: "authors"
              }
            }
          }
        },
        {
          type: "books",
          id: "3",
          attributes: {
            title: "Peanut Butter & Cupcake"
          }
        },
        {
          type: "genres",
          id: "1",
          attributes: {
            name: "Children's"
          },
          relationships: {
            authors: {
              data: [{ id: "1", type: "authors" }, { id: "2", type: "authors" }]
            }
          }
        },
        {
          type: "authors",
          id: "2",
          attributes: {
            firstName: "Maurice Sendak"
          }
        },
        {
          type: "bios",
          id: "1",
          attributes: {
            description: "Some Dude."
          }
        }
      ]
    }

    it("assigns id correctly", () => {
      const instance = new Author()
      instance.fromJsonapi(doc.data, doc)
      expect(instance.id).to.eq("1")
    })

    it("instantiates the correct model for jsonapi type", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      expect(instance).to.be.instanceof(Author)
    })

    it("assigns attributes correctly", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      expect(instance.firstName).to.eq("Donald Budge")
      expect(instance.attributes).to.eql({
        firstName: "Donald Budge",
        nilly: null
      })
    })

    it("camelizes relationship names", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      expect(instance.multiWords.length).to.eq(1)
    })

    it("does not assign unknown attributes", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      expect(instance).to.not.have.property("unknown")
    })

    it("does not assign unknown relationships", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      expect(instance).to.not.have.property("unknownrelationship")
    })

    it("does not blow up on null attributes", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      expect(instance.nilly).to.eq(null)
    })

    it("assigns metadata correctly", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      expect(instance.__meta__).to.eql({
        big: true
      })
    })

    it("assigns hasMany relationships correctly", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      expect(instance.books.length).to.eq(2)
      const book = instance.books[0]
      expect(book).to.be.instanceof(Book)
      expect(book.title).to.eq("Where's My Butt?")
    })

    it("assigns hasMany relationships with same jsonapiType correctly", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      expect(instance.specialBooks.length).to.eq(1)
      const book = instance.specialBooks[0]
      expect(book).to.be.instanceof(Book)
      expect(book.title).to.eq("Peanut Butter & Cupcake")
    })

    it("assigns belongsTo relationships correctly", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      const genre = instance.genre
      expect(genre).to.be.instanceof(Genre)
      expect(genre.name).to.eq("Children's")
    })

    it("assigns hasOnModelnships correctly", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      const bio = instance.bio
      expect(bio).to.be.instanceof(Bio)
      expect(bio.description).to.eq("Some Dude.")
    })

    it("assigns neste relationships correctly", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      const authors = instance.genre.authors
      expect(authors.length).to.eq(2)
      expect(authors[0]).to.be.instanceof(Author)
      expect(authors[1]).to.be.instanceof(Author)
      expect(authors[0].firstName).to.eq("Donald Budge")
      expect(authors[1].firstName).to.eq("Maurice Sendak")
    })

    it("assigns duplicated nested relationships correctly", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      const book1 = instance.books[0]
      const book2 = instance.books[1]

      expect(book1.author.firstName).to.eq("Maurice Sendak")
      expect(book2.author.firstName).to.eq("Maurice Sendak")
    })

    it("skips relationships without data", () => {
      const instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      expect(instance.tags).to.eql([])
    })

    it("preserves other properties on the object", () => {
      const instance: any = new Author({ id: "1" })
      instance.fooble = "bar"
      const same = instance.fromJsonapi(doc.data, doc)
      expect(same).to.eq(instance)

      expect(instance.id).to.eq("1")
      expect(instance.firstName).to.eq("Donald Budge")
      expect(instance.fooble).to.eq("bar")
    })

    it("preserves other properties on relationships", () => {
      const genre: any = new Genre({ id: "1" })
      genre.bar = "baz"
      const book: any = new Book({ id: "1", genre })
      book.foo = "bar"
      const instance: any = new Author({ id: "1", books: [book] })
      instance.fromJsonapi(doc.data, doc)

      expect(instance.books[0]).to.eq(book)
      expect(instance.books[0].genre).to.eq(genre)

      expect(book.title).to.eq("Where's My Butt?")
      expect(book.foo).to.eq("bar")
      expect(genre.bar).to.eq("baz")
    })
  })

  describe("changes", () => {
    describe("when unpersisted", () => {
      it("counts everything but nulls", () => {
        const instance = new Author({ firstName: "foo" })
        expect(instance.changes()).to.deep.equal({
          firstName: [null, "foo"]
        })
      })
    })

    describe("when persisted", () => {
      it("only counts dirty attrs", () => {
        const instance = new Author({ firstName: "foo" })
        instance.isPersisted = true
        expect(instance.changes()).to.deep.equal({})
        instance.firstName = "bar"

        expect(instance.changes()).to.deep.equal({
          firstName: ["foo", "bar"]
        })
        instance.isPersisted = true
        expect(instance.changes()).to.deep.equal({})
      })
    })
  })

  describe("isDirty", () => {
    describe("when an attribute changes", () => {
      it("is marked as dirty", () => {
        const instance = new Author()
        instance.isPersisted = true
        expect(instance.isDirty()).to.eq(false)
        instance.firstName = "Joe"
        expect(instance.isDirty()).to.eq(true)
        instance.isPersisted = true
      })
    })

    describe("when not persisted", () => {
      describe("and no attributes", () => {
        it("is not dirty", () => {
          const instance = new Author()
          expect(instance.isDirty()).to.eq(false)
        })
      })

      describe("and has attributes", () => {
        it("is dirty", () => {
          const instance = new Author({ firstName: "Stephen" })
          expect(instance.isDirty()).to.eq(true)
          instance.isPersisted = true
          expect(instance.isDirty()).to.eq(false)
        })
      })
    })

    describe("when dirty, then persisted", () => {
      it("is no longer dirty", () => {
        const instance = new Author()
        instance.firstName = "foo"
        expect(instance.isDirty()).to.eq(true)
      })
    })

    describe("when previously persisted, dirty, then persisted again", () => {
      it("is no longer dirty", () => {
        const instance = new Author({ id: 1 })
        instance.firstName = "foo"
        instance.isPersisted = true
        expect(instance.isDirty()).to.eq(false)
        instance.firstName = "bar"
        expect(instance.isDirty()).to.eq(true)
        instance.isPersisted = true
        expect(instance.isDirty()).to.eq(false)
      })
    })

    describe("when marked for destruction", () => {
      it("is dirty", () => {
        const instance = new Author()
        instance.isPersisted = true
        expect(instance.isDirty()).to.eq(false)
        instance.isMarkedForDestruction = true
        expect(instance.isDirty()).to.eq(true)
      })
    })

    describe("when marked for disassociation", () => {
      it("is dirty", () => {
        const instance = new Author()
        instance.isPersisted = true
        expect(instance.isDirty()).to.eq(false)
        instance.isMarkedForDisassociation = true
        expect(instance.isDirty()).to.eq(true)
      })
    })

    describe("when passed relationships", () => {
      let instance: Author

      beforeEach(() => {
        const book = new Book({ id: 1, title: "original" })
        instance = new Author({ books: [book] })
      })

      it("works with string/object/array include graph", () => {
        instance.books[0].isPersisted = true
        const authorGenre = new Genre({ id: 1 })
        const bookGenre = new Genre({ id: 2 })
        authorGenre.isPersisted = true
        bookGenre.isPersisted = true
        instance.books[0].genre = bookGenre
        instance.genre = authorGenre
        instance.books[0].isPersisted = true
        instance.isPersisted = true

        const check = () => {
          return instance.isDirty(["genre", { books: "genre" }])
        }

        expect(check()).to.eq(false)
        instance.genre.name = "changed"
        expect(check()).to.eq(true)
        instance.genre.isPersisted = true

        expect(check()).to.eq(false)
        instance.books[0].title = "changed"
        expect(check()).to.eq(true)
        instance.books[0].isPersisted = true

        expect(check()).to.eq(false)
        instance.books[0].genre.name = "changed"
        expect(check()).to.eq(true)
      })

      it("is not dirty when relationship not passed, even if relationship is dirty", () => {
        instance.books[0].isPersisted = true
        instance.isPersisted = true

        expect(instance.isDirty("genre")).to.eq(false)
        expect(instance.isDirty("books")).to.eq(false)
        instance.books[0].title = "dirty"
        expect(instance.isDirty("books")).to.eq(true)
        expect(instance.isDirty("genre")).to.eq(false)
      })

      describe("when a hasMany relationship adds a new unpersisted member", () => {
        it("is dirty", () => {
          instance.books = []
          instance.isPersisted = true
          expect(instance.isDirty("books")).to.eq(false)
          instance.books.push(new Book({ title: "asdf" }))
          expect(instance.isDirty("books")).to.eq(true)
        })
      })

      describe("when a hasMany relationship adds a new persisted member", () => {
        it("is dirty", () => {
          instance = new Author({ id: 1 })
          instance.isPersisted = true
          instance.books = []
          instance.isPersisted = true
          expect(instance.isDirty("books")).to.eq(false)
          const book = new Book({ id: 99 })
          book.isPersisted = true
          instance.books.push(book)

          expect(instance.isDirty("books")).to.eq(true)
          instance.isPersisted = true
          expect(instance.isDirty("books")).to.eq(false)
        })
      })

      describe("when a belongsTo changes a persisted member", () => {
        it("is dirty", () => {
          instance = new Author()
          const genre = new Genre({ id: 1 })
          genre.isPersisted = true
          const otherGenre = new Genre({ id: 2 })
          otherGenre.isPersisted = true

          instance.genre = genre
          instance.isPersisted = true

          expect(instance.isDirty()).to.eq(false)
          instance.genre = otherGenre
          expect(instance.isDirty("genre")).to.eq(true)
          expect(instance.isDirty()).to.eq(false)

          instance.isPersisted = true
          expect(instance.isDirty("genre")).to.eq(false)
        })
      })

      describe("when a hasMany relationship has a member marked for destruction", () => {
        it("is dirty", () => {
          const book = new Book({ id: 1 })
          book.isPersisted = true
          instance.books = [book]
          instance.isPersisted = true

          expect(instance.isDirty("books")).to.eq(false)
          book.isMarkedForDestruction = true
          expect(instance.isDirty("books")).to.eq(true)
          expect(instance.isDirty()).to.eq(false)
        })
      })

      describe("when a hasMany relationship has a member marked for disassociation", () => {
        it("is dirty", () => {
          const book = new Book({ id: 1 })
          book.isPersisted = true
          instance.books = [book]
          instance.isPersisted = true

          expect(instance.isDirty("books")).to.eq(false)
          book.isMarkedForDisassociation = true
          expect(instance.isDirty("books")).to.eq(true)
          expect(instance.isDirty()).to.eq(false)
        })
      })
    })

    describe("when a has-many is marked for destruction", () => {
      let newDoc: JsonapiResponseDoc
      let instance: Author
      let book: Book

      beforeEach(() => {
        book = new Book({ id: "1" })
        book.isPersisted = true
        book.isMarkedForDestruction = true

        instance = new Author({ books: [book] })

        newDoc = {
          data: {
            id: "1",
            type: "authors"
          }
        }
      })

      describe("when the relation is part of the include directive", () => {
        it("is removed from the array", () => {
          expect(instance.books.length).to.eq(1)
          instance.fromJsonapi(newDoc.data as JsonapiResource, newDoc, {
            books: {}
          })
          expect(instance.books.length).to.eq(0)
        })
      })

      describe("when the relation is not part of the include directive", () => {
        it("is NOT removed from the array", () => {
          expect(instance.books.length).to.eq(1)
          instance.fromJsonapi(newDoc.data as JsonapiResource, newDoc, {})
          expect(instance.books.length).to.eq(1)
        })
      })
    })

    describe("when a has-many is marked for disassociation", () => {
      let newDoc: JsonapiResponseDoc
      let instance: Author
      let book: Book

      beforeEach(() => {
        book = new Book({ id: "1" })
        book.isPersisted = true
        book.isMarkedForDisassociation = true

        instance = new Author({ books: [book] })

        newDoc = {
          data: {
            id: "1",
            type: "authors"
          }
        }
      })

      describe("when the relation is part of the include directive", () => {
        it("is removed from the array", () => {
          expect(instance.books.length).to.eq(1)
          instance.fromJsonapi(newDoc.data as JsonapiResource, newDoc, {
            books: {}
          })
          expect(instance.books.length).to.eq(0)
        })
      })

      describe("when the relation is not part of the include directive", () => {
        it("is NOT removed from the array", () => {
          expect(instance.books.length).to.eq(1)
          instance.fromJsonapi(newDoc.data as JsonapiResource, newDoc, {})
          expect(instance.books.length).to.eq(1)
        })
      })
    })

    describe("when a belongs-to is marked for destruction", () => {
      let newDoc: JsonapiResponseDoc
      let instance: Author
      let book: Book

      beforeEach(() => {
        const genre = new Genre({ id: "1" })
        genre.isPersisted = true
        genre.isMarkedForDestruction = true

        book = new Book({ id: "1", genre })
        book.isPersisted = true

        instance = new Author({ books: [book] })

        newDoc = {
          data: {
            id: "1",
            type: "authors",
            relationships: {
              books: {
                data: [{ id: "1", type: "books" }]
              }
            }
          },
          included: [
            {
              id: "1",
              type: "books",
              attributes: { title: "whatever" }
            }
          ]
        }
      })

      it("is set to null", () => {
        expect(instance.books[0].genre).to.be.instanceof(Genre)
        instance.fromJsonapi(newDoc.data as JsonapiResource, newDoc, {
          books: { genre: {} }
        })
        expect(instance.books[0].genre).to.eq(undefined)
      })

      describe("within a nested destruction", () => {
        beforeEach(() => {
          book.isMarkedForDestruction = true
        })

        it("is removed via the parent", () => {
          instance.fromJsonapi(newDoc.data as JsonapiResource, newDoc, {
            books: { genre: {} }
          })
          expect(instance.books.length).to.eq(0)
        })
      })
    })

    describe("when a belongs-to is marked for disassociation", () => {
      let newDoc: JsonapiResponseDoc
      let instance: Author
      let book: Book

      beforeEach(() => {
        const genre = new Genre({ id: "1" })
        genre.isPersisted = true
        genre.isMarkedForDisassociation = true

        book = new Book({ id: "1", genre })
        book.isPersisted = true

        instance = new Author({ books: [book] })

        newDoc = {
          data: {
            id: "1",
            type: "authors",
            relationships: {
              books: {
                data: [{ id: "1", type: "books" }]
              }
            }
          },
          included: [
            {
              id: "1",
              type: "books",
              attributes: { title: "whatever" }
            }
          ]
        }
      })

      it("is set to null", () => {
        expect(instance.books[0].genre).to.be.instanceof(Genre)
        instance.fromJsonapi(newDoc.data as JsonapiResource, newDoc, {
          books: { genre: {} }
        })
        expect(instance.books[0].genre).to.eq(null)
      })

      describe("within a nested destruction", () => {
        beforeEach(() => {
          book.isMarkedForDisassociation = true
        })

        it("is removed via the parent", () => {
          instance.fromJsonapi(newDoc.data as JsonapiResource, newDoc, {
            books: { genre: {} }
          })
          expect(instance.books.length).to.eq(0)
        })
      })
    })
  })

  describe("#unlisten()", () => {
    let author: Author
    let book: Book
    let removeListenerSpy: SinonSpy

    beforeEach(() => {
      ApplicationRecord.sync = true
      removeListenerSpy = sinon.spy(EventBus, "removeEventListener")
      book = new Book({ id: 1 })
      book.isPersisted = true
      author = new Author({ id: 1, books: [book] })
      author.isPersisted = true
    })

    afterEach(() => {
      (removeListenerSpy).restore()
    })

    it("removes event listener from self + relationships", () => {
      author.unlisten()
      sinon.assert.callCount(removeListenerSpy, 2)
    })

    describe("when sync option is false", () => {
      beforeEach(() => {
        ApplicationRecord.sync = false
        author = new Author()
      })

      it("does nothing", () => {
        author.unlisten()
        sinon.assert.callCount(removeListenerSpy, 0)
      })
    })
  })

  describe("#listen()", () => {
    let author: Author
    let addListenerSpy: SinonSpy

    beforeEach(() => {
      ApplicationRecord.sync = true
      addListenerSpy = sinon.spy(EventBus, "addEventListener")
      author = new Author()
    })

    afterEach(() => {
      addListenerSpy.restore()
    })

    it("adds event listener", () => {
      author.listen()
      sinon.assert.callCount(addListenerSpy, 1)
    })

    describe("when sync option is false", () => {
      beforeEach(() => {
        ApplicationRecord.sync = false
        author = new Author()
      })

      it("does nothing", () => {
        author.listen()
        sinon.assert.callCount(addListenerSpy, 0)
      })
    })
  })

  describe("#relationshipResourceIdentifiers()", () => {
    @Model()
    class RelationGraph extends ApplicationRecord {
      @BelongsTo({ type: Author })
      author!: Author
      @HasMany({ type: Book })
      books!: Book
      @HasOne({ type: Bio })
      bio!: Bio
    }

    let instance: RelationGraph

    describe("when no relations set", () => {
      it("is empty", () => {
        instance = new RelationGraph()
        const relationNames = Object.keys(instance.relationships)
        expect(
          instance.relationshipResourceIdentifiers(relationNames)
        ).to.deep.equal({})
      })
    })

    describe("when relations set", () => {
      it("returns correct object", () => {
        const author = new Author({ id: 1 })
        author.isPersisted = true
        const book = new Book({ id: 1 })
        book.isPersisted = true
        const bio = new Bio({ id: 1 })
        bio.isPersisted = true
        instance = new RelationGraph({ author, bio, books: [book] })
        const relationNames = Object.keys(instance.relationships)
        expect(
          instance.relationshipResourceIdentifiers(relationNames)
        ).to.deep.equal({
          author: [{ id: 1, type: "authors" }],
          books: [{ id: 1, type: "books" }],
          bio: [{ id: 1, type: "bios" }]
        })
      })

      it("does not contain identifiers without ids", () => {
        const book1 = new Book({ id: 1 })
        const book2 = new Book()
        book1.isPersisted = true
        instance = new RelationGraph({ books: [book1, book2] })
        const relationNames = Object.keys(instance.relationships)
        expect(
          instance.relationshipResourceIdentifiers(relationNames)
        ).to.deep.equal({
          books: [{ id: 1, type: "books" }]
        })
      })
    })
  })

  describe("#url", () => {
    context("Default base URL generation method", () => {
      it("should append the baseUrl, apiNamespace, and jsonapi type", () => {
        class DefaultBaseUrl extends ApplicationRecord {
          static baseUrl: string = "http://base.com"
          static apiNamespace: string = "/namespace/v1"
          static jsonapiType: string = "testtype"
        }

        expect(DefaultBaseUrl.url("testId")).to.eq(
          "http://base.com/namespace/v1/testtype/testId"
        )
      })
    })

    context("Base URL path generation is overridden", () => {
      it("should use the result of the override", () => {
        class OverriddenBaseUrl extends ApplicationRecord {
          static jsonapiType: string = "testtype"
          static fullBasePath(): string {
            return "http://overridden.base"
          }
        }

        expect(OverriddenBaseUrl.url("testId")).to.eq(
          "http://overridden.base/testtype/testId"
        )
      })
    })
  })

  describe("#dup()", () => {
    it("returns a new instance of the same object", () => {
      let author = new Author({ id: '1', firstName: "Stephen" })
      author.isPersisted = true
      author.isMarkedForDestruction = true
      author.isMarkedForDisassociation = true

      let errors = { firstName: { title: "asdf" } } as any
      author.errors = errors
      let duped = author.dup()
      duped.firstName = "updated"
      expect(author.firstName).to.eq("Stephen")
      expect(duped.firstName).to.eq("updated")
      expect(duped.id).to.eq("1")
      expect(duped.isPersisted).to.eq(true)
      expect(duped.isMarkedForDestruction).to.eq(true)
      expect(duped.isMarkedForDisassociation).to.eq(true)
      expect(duped.errors).to.deep.equal({ firstName: { title: "asdf" } })
      duped.isPersisted = false
      expect(author.isPersisted).to.eq(true)
      let dupErrors = duped.errors as any
      dupErrors.firstName = "new"
      expect(author.errors.firstName).to.deep.eq({ title: "asdf" })
    })

    it("does not recast nonenumerables to enumerable", () => {
      let author = new Author({ firstName: "Stephen" })
      let duped = author.dup()

      let descriptor = Object.getOwnPropertyDescriptor(author, 'relationships') as PropertyDescriptor
      expect(descriptor.enumerable).to.eq(false)
      descriptor = Object.getOwnPropertyDescriptor(duped, 'relationships') as PropertyDescriptor
      expect(descriptor.enumerable).to.eq(false)
    })

    // NB: does NOT dupe the relationships
    describe("when nested relationships", () => {
      it("still works", () => {
        let author = new Author({ firstName: "Stephen" })
        author.isPersisted = true
        let genre = new Genre({ name: 'Horror' })
        genre.isPersisted = true
        let book1 = new Book({ genre })
        book1.isPersisted = true
        author.books = [book1]
        let duped = author.dup()
        expect(duped.books).to.deep.eq([book1])
        expect(duped.books[0].isPersisted).to.eq(true)
        expect(duped.books[0].genre).to.eq(genre)
        expect(duped.books[0].genre.isPersisted).to.eq(true)
      })
    })
  })

  describe("#fetchOptions", () => {
    context("jwt is set", () => {
      let stub : SinonStub

      beforeEach(() => {
        stub = sinon.stub(ApplicationRecord, 'getJWT')
        stub.returns('g3tm3')
      })

      afterEach(() => {
        stub.restore()
      })

      it("sets the auth header", () => {
        expect((<any>Author.fetchOptions().headers).Authorization).to.eq(
          'Token token="g3tm3"'
        )
      })
    })

    it("includes the content headers", () => {
      const headers: any = Author.fetchOptions().headers
      expect(headers.Accept).to.eq("application/json")
      expect(headers["Content-Type"]).to.eq("application/json")
    })
  })
})
