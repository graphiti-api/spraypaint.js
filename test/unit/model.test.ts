import { expect, sinon } from '../test-helper';
import { JSORMBase } from '../../src/model'
import { belongsTo, hasOne, hasMany } from '../../src/associations'
import { Attribute, AttributeValue, attr } from '../../src/attribute'

import {
  ApplicationRecord,
//   TestJWTSubclass,
//   NonJWTOwner,
  Person,
  Book,
  Author,
  Genre,
  Bio
} from '../fixtures';

import { 
  Model, 
  Attr,
  HasOne, 
  HasMany, 
  BelongsTo, 
} from '../../src/decorators'

describe('Model', () => {
  describe('Class Creation/Initialization', () => {
    describe('Typescript Classes + Decorators API', () => {
      describe('Base Class', () => {
        it('creates a new model types registry and assigns to the base class', () => {
          @Model()
          class TestBase extends JSORMBase {}

          expect(JSORMBase.typeRegistry).to.be.undefined
          expect(TestBase.isBaseClass).to.be.true
          expect(TestBase.typeRegistry).not.to.be.undefined
        })
      })

      @Model()
      class BaseModel extends JSORMBase {}

      @Model()
      class Post extends BaseModel {
        @Attr title : string
        @BelongsTo({type: Person}) author : Person

        screamTitle(exclamationPoints: number) : string {
          let loudness : string = ''

          for(let i = 0; i < exclamationPoints; i++) {
            loudness += '!'
          }

          return `${this.title.toUpperCase()}${loudness}`
        }
      }

      it('sets up expected inheritance hierarchy', () => {
        expect(Post.currentClass).to.equal(Post)
        expect(Post.parentClass).to.equal(BaseModel)
        expect(Post.isBaseClass).to.be.false
        let instance = new Post()

        expect((<any>instance).klass).to.eq(Post)
      })

      it('sets a default jsonapi type', () => {
        @Model()
        class TestType extends BaseModel { }

        expect(TestType.jsonapiType).to.eq('test_types')
      })

      it('obeys explicit jsonapi type', () => {
        @Model({jsonapiType: "my_type"})
        class TestType extends BaseModel { }

        expect(TestType.jsonapiType).to.eq('my_type')
      })

      it('adds the instance to the type registry', () => {
        expect(BaseModel.typeRegistry.get('posts')).to.equal(Post)
      })

      it('correctly instantiates the model', () => {
        let theAuthor = new Person()
        let post  = new Post({title: 'The Title', author: theAuthor})

        expect(post.author).to.equal(theAuthor)
        expect(post.screamTitle(3)).to.equal('THE TITLE!!!')
      })

      it('sets up attribute getters/setters', () => {
        let post  = new Post({title: 'The Title'})

        expect(post._attributes).to.deep.equal({
          title: 'The Title'
        })

        post.title = 'new title'

        expect(post._attributes).to.deep.equal({
          title: 'new title'
        })
        expect(post.screamTitle(3)).to.equal('NEW TITLE!!!')
      })

      describe('model inheritence', () => {
        @Model()
        class FrontPagePost extends Post {
          @Attr() pageOrder: number

          isFirst() {
            return this.pageOrder === 1
          }
        }

        it('sets up expected inheritance hierarchy', () => {
          expect(FrontPagePost.currentClass).to.equal(FrontPagePost)
          expect(FrontPagePost.parentClass).to.equal(Post)
          let instance = new FrontPagePost()

          expect((<any>instance).klass).to.eq(FrontPagePost)
        })

        it('allows extension of the model', () => { 
          let post = new FrontPagePost({title: 'The Title' , pageOrder: 1})

          expect(post.screamTitle(3)).to.equal('THE TITLE!!!')
          expect(post.isFirst()).to.be.true
        })

        it('does not modify the parent attributes', () => { 
          expect(() => {
            new Post({title: 'The Title' , pageOrder: 1})
          }).to.throw(/Unknown attribute: pageOrder/)
        })
      })

      describe('model inheritence with .extends() API', () => {
        const FrontPagePost = Post.extend({
          attrs: {
            pageOrder: attr({type: Number})
          },
          methods: {
            isFirst() {
              return this.pageOrder === 1
            }
          }
        })

        it('allows extension of the model', () => {
          let post  = new FrontPagePost({title: 'The Title' , pageOrder: 1})

          expect(post.screamTitle(3)).to.equal('THE TITLE!!!')
          expect(post.isFirst()).to.be.true
        })
      })

      describe('class options', () => {
        let config = {
          apiNamespace: 'api/v1',
          jsonapiType: 'my_types',
          jwt: 'abc123', 
        }

        @Model(config)
        class MyModel extends BaseModel { }

        it('preserves defaults for unspecified items', () => {
          expect(MyModel.baseUrl).to.eq('http://please-set-a-base-url.com')
          expect(MyModel.camelizeKeys).to.be.true
        })

        it('correctly assigns options', () => {
          expect(MyModel.apiNamespace).to.eq(config.apiNamespace)
          expect(MyModel.jsonapiType).to.eq(config.jsonapiType)
          expect(MyModel.jwt).to.eq(config.jwt)
        })

        it('does not override parent class options', () => {
          expect(BaseModel.apiNamespace).not.to.eq(config.apiNamespace)
          expect(BaseModel.jsonapiType).not.to.eq(config.jsonapiType)
          expect(BaseModel.jwt).not.to.eq(config.jwt)
        })
      })
    })

    describe('.extend() API', () => {
      const BaseModel = JSORMBase.extend({

      })

      const Person = BaseModel.extend({
      })

      const Post = BaseModel.extend({
        attrs: {
          title: attr({ type: String }),
          author: hasOne({ type: Person })
        },
        methods: {
          screamTitle(exclamationPoints: number) : string {
            let loudness : string = ''

            for(let i = 0; i < exclamationPoints; i++) {
              loudness += '!'
            }

            return `${this.title.toUpperCase()}${loudness}`
          },
          other() : boolean {
            return true
          }
        }
      })

      it('sets up expected inheritance hierarchy', () => {
        expect(Post.currentClass).to.equal(Post)
        expect(Post.parentClass).to.equal(BaseModel)
        let instance = new Post()

        expect((<any>instance).klass).to.eq(Post)
      })

      it('correctly instantiates the model', () => {
        let theAuthor = new Person()
        let post = new Post({title: 'The Title', author: theAuthor})

        expect(post.author).to.equal(theAuthor)
        expect(post.screamTitle(3)).to.equal('THE TITLE!!!')
      })

      it('sets up attribute getters/setters', () => {
        let post  = new Post({title: 'The Title'})

        expect(post._attributes).to.deep.equal({
          title: 'The Title'
        })

        post.title = 'new title'

        expect(post._attributes).to.deep.equal({
          title: 'new title'
        })
        expect(post.screamTitle(3)).to.equal('NEW TITLE!!!')
      })

      describe('model inheritence', () => {
        const FrontPagePost = Post.extend({
          attrs: {
            pageOrder: attr({type: Number})
          },
          methods: {
            isFirst() {
              return this.pageOrder === 1
            }
          }
        })

        it('sets up expected inheritance hierarchy', () => {
          expect(FrontPagePost.currentClass).to.equal(FrontPagePost)
          expect(FrontPagePost.parentClass).to.equal(Post)
          let instance = new FrontPagePost()

          expect((<any>instance).klass).to.eq(FrontPagePost)
        })

        it('allows extension of the model', () => {
          let post  = new FrontPagePost({title: 'The Title' , pageOrder: 1})

          expect(post.screamTitle(3)).to.equal('THE TITLE!!!')
          expect(post.isFirst()).to.be.true
        })

        it('does not modify the parent attributes', () => { 
          expect(() => { 
            new Post((<any>{title: 'The Title' , pageOrder: 1})) 
          }).to.throw(/Unknown attribute: pageOrder/)
        })
      })

      describe('inheritance with class-based declaration', () => {
        class FrontPagePost extends Post {
          @Attr pageOrder : number

          isFirst() {
            return this.pageOrder === 1
          }
        }

        it('allows extension of the model', () => {
          let post  = new FrontPagePost({title: 'The Title' , pageOrder: 1})

          expect(post.screamTitle(3)).to.equal('THE TITLE!!!')
          expect(post.isFirst()).to.be.true
        })

        it('does not modify the parent attributes', () => { 
          expect(() => { 
            new Post((<any>{title: 'The Title' , pageOrder: 1})) 
          }).to.throw(/Unknown attribute: pageOrder/)
        })
      })

      describe('class options', () => {
        const configProps : Array<'static' | 'config'> = ['static', 'config']

        configProps.forEach((prop) => {
          describe(`config prop is "${prop}"`, () => {
            let config = {
              apiNamespace: 'api/v1',
              jsonapiType: 'test_types',
              jwt: 'abc123', 
            }

            let MyModel = BaseModel.extend({
              [prop]: config
            })

            it('preserves defaults for unspecified items', () => {
              expect(MyModel.baseUrl).to.eq('http://please-set-a-base-url.com')
              expect(MyModel.camelizeKeys).to.be.true
            })

            it('correctly assigns options', () => {
              expect(MyModel.apiNamespace).to.eq(config.apiNamespace)
              expect(MyModel.jsonapiType).to.eq(config.jsonapiType)
              expect(MyModel.jwt).to.eq(config.jwt)
            })

            it('does not override parent class options', () => {
              expect(BaseModel.apiNamespace).not.to.eq(config.apiNamespace)
              expect(BaseModel.jsonapiType).not.to.eq(config.jsonapiType)
              expect(BaseModel.jwt).not.to.eq(config.jwt)
            })
          })
        })
      })
    })

    describe('Instance Behavior', () => {
      describe('isMarkedForDestruction', () => {
        it('toggles correctly', () => {
          let instance = new Author();
          expect(instance.isMarkedForDestruction).to.eq(false)
          instance.isMarkedForDestruction = true
          expect(instance.isMarkedForDestruction).to.eq(true)
          instance.isMarkedForDestruction = false
          expect(instance.isMarkedForDestruction).to.eq(false)
        });
      });

      describe('isMarkedForDisassociation', () => {
        it('toggles correctly', () => {
          let instance = new Author();
          expect(instance.isMarkedForDisassociation).to.eq(false)
          instance.isMarkedForDisassociation = true
          expect(instance.isMarkedForDisassociation).to.eq(true)
          instance.isMarkedForDisassociation = false
          expect(instance.isMarkedForDisassociation).to.eq(false)
        });
      });

      describe('#isType', () => {
        it('checks the jsonapiType of class', () => {
          let instance = new Author()
          expect(instance.isType('authors')).to.eq(true)
          expect(instance.isType('people')).to.eq(false)
        });
      });

    })
  })

  describe('#fromJsonapi', () => {
    let doc = {
      data: {
        id: '1',
        type: 'authors',
        attributes: {
          firstName: 'Donald Budge',
          unknown: 'adsf',
          nilly: null
        },
        relationships: {
          unknownrelationship: {
            data: {
              id: '1',
              type: 'unknowns'
            }
          },
          multi_words: {
            data: [{
              id: '1',
              type: 'multi_words'
            }]
          },
          tags: {},
          genre: {
            data: {
              id: '1',
              type: 'genres'
            }
          },
          books: {
            data: [{
              id: '1',
              type: 'books'
            }, {
              id: '2',
              type: 'books'
            }]
          },
          special_books: {
            data: [{
              id: '3',
              type: 'books'
            }]
          },
          bio: {
            data: {
              id: '1',
              type: 'bios'
            }
          }
        },
        meta: {
          big: true
        }
      },
      included: [
        {
          type: 'books',
          id: '1',
          attributes: {
            title: "Where's My Butt?"
          },
          relationships: {
            author: {
              data: {
                id: '2',
                type: 'authors' 
              },
            }
          }
        },
        {
          type: 'books',
          id: '2',
          attributes: {
            title: "Catcher in the Rye"
          },
          relationships: {
            author: {
              data: { 
                id: '2', 
                type: 'authors' 
              },
            }
          }
        },
        {
          type: 'books',
          id: '3',
          attributes: {
            title: "Peanut Butter & Cupcake"
          }
        },
        {
          type: 'genres',
          id: '1',
          attributes: {
            name: "Children's"
          },
          relationships: {
            authors: {
              data: [
                { id: '1', type: 'authors' },
                { id: '2', type: 'authors' }
              ]
            }
          }
        },
        {
          type: 'authors',
          id: '2',
          attributes: {
            firstName: 'Maurice Sendak'
          }
        },
        {
          type: 'bios',
          id: '1',
          attributes: {
            description: 'Some Dude.'
          }
        }
      ]
    };

    // it('assigns id correctly', () => {
    //   let instance = new Author();
    //   instance.fromJsonapi(doc.data, doc);
    //   expect(instance.id).to.eq('1');
    // });

    it('instantiates the correct model for jsonapi type', () => {
      let instance = ApplicationRecord.fromJsonapi(doc.data, doc);
      expect(instance).to.be.instanceof(Author);
    });

    it('assigns attributes correctly', () => {
      let instance = ApplicationRecord.fromJsonapi(doc.data, doc);
      expect(instance.firstName).to.eq('Donald Budge');
      expect(instance.attributes).to.eql({
        firstName: 'Donald Budge',
        nilly: null
      })
    });

    it('camelizes relationship names', () => {
      let instance = ApplicationRecord.fromJsonapi(doc.data, doc);
      expect(instance.multiWords.length).to.eq(1);
    });

    it('does not assign unknown attributes', () => {
      let instance = ApplicationRecord.fromJsonapi(doc.data, doc);
      expect(instance).to.not.have.property('unknown');
    });

    it('does not assign unknown relationships', () => {
      let instance = ApplicationRecord.fromJsonapi(doc.data, doc);
      expect(instance).to.not.have.property('unknownrelationship');
    });

    it('does not blow up on null attributes', () => {
      let instance = ApplicationRecord.fromJsonapi(doc.data, doc);
      expect(instance.nilly).to.eq(null);
    });

    it('assigns metadata correctly', () => {
      let instance = ApplicationRecord.fromJsonapi(doc.data, doc);
      expect(instance.__meta__).to.eql({
        big: true
      })
    });

    it('assigns hasMany relationships correctly', () => {
      let instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      expect(instance.books.length).to.eq(2)
      let book = instance.books[0]
      expect(book).to.be.instanceof(Book)
      expect(book.title).to.eq("Where's My Butt?"); 
    })

    it('assigns hasMany relationships with same jsonapiType correctly', () => { 
      let instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      expect(instance.specialBooks.length).to.eq(1)
      let book = instance.specialBooks[0]
      expect(book).to.be.instanceof(Book)
      expect(book.title).to.eq("Peanut Butter & Cupcake")
    })

    it('assigns belongsTo relationships correctly', () => {
      let instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      let genre = instance.genre
      expect(genre).to.be.instanceof(Genre)
      expect(genre.name).to.eq("Children's")
    });

    it('assigns hasOnModelnships correctly', () => {
      let instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      let bio = instance.bio
      expect(bio).to.be.instanceof(Bio)
      expect(bio.description).to.eq("Some Dude.")
    });

    it('assigns nesteModelnships correctly', () => {
      let instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      let authors = instance.genre.authors
      expect(authors.length).to.eq(2)
      expect(authors[0]).to.be.instanceof(Author)
      expect(authors[1]).to.be.instanceof(Author)
      expect(authors[0].firstName).to.eq('Donald Budge')
      // expect(authors[Modelame).to.eq('Maurice Sendak');
    });

    it('assigns duplicated nested relationships correctly', () => {
      let instance = ApplicationRecord.fromJsonapi(doc.data, doc)
      let book1 = instance.books[0]
      let book2 = instance.books[1]

      expect(book1.author.firstName).to.eq("Maurice Sendak")
      expect(book2.author.firstName).to.eq("Maurice Sendak")
    })

    it('skips relationships without data', () => {
      let instance = JSORMBase.fromJsonapi(doc.data, doc)
      expect(instance.tags).to.eql([])
    });

    // it('preserves other properties on the object', () => {
    //   let instance = new Author({ id: '1' });
    //   instance['foJSORMBase'bar';
    //   let same = instance.fromJsonapi(doc.data, doc);
    //   expect(same).to.eq(instance);

    //   expect(instance.id).to.eq('1');
    //   expect(instance.firstName).to.eq('Donald Budge');
    //   expect(instance['fooble']).to.eq('bar');
    // });
// // 
    // it('preserves other properties on relationships', function() {
    //   let genre = new Genre({ id: '1' });
    //   genre['bar'] = 'baz';
    //   let book = new Book({ id: '1', genre: genre });
    //   book['foo'] = 'bar';
    //   let instance = new Author({ id: '1', books: [book] });
    //   instance.fromJsonapi(doc.data, doc);
 // //
    //   expect(instance.books[0]).to.eq(book);
    //   expect(instance.books[0].genre).to.eq(genre);
 // //
    //   expect(book.title).to.eq("Where's My Butt?");
    //   expect(book['foo']).to.eq('bar');
    //   expect(genre['bar']).to.eq('baz');
    // } 
  }) //

  //// scribe('relationshipResourceIdentifiers', function() {
  //// @Model()
  //// c ass RelationGraph extends ApplicationRecord {
  //   
  //     @HasMany({type: Book}) books : Book
  //     @HasOne({type: Bio}) bio : Bio
  //   }

  //   let instance : RelationGraph

  //   describe('when no relations set', function() {
  //     it('is empty', function() {
  //       instance = new RelationGraph();
  //       let relationNames = Object.keys(instance.relationships);
  //       expect(instance.relationshipResourceIdentifiers(relationNames))
  //         .to.deep.equal({});
  //     });
  //   });

  //   describe('when relations set', function() {
  //     it('returns correct object', function() {
  //       let author = new Author({ id: 1 });
  //       author.isPersisted(true);
  //       let book = new Book({ id: 1 });
  //       book.isPersisted(true);
  //       let bio = new Bio({ id: 1 });
  //       bio.isPersisted(true);
  //       instance = new RelationGraph({ author, bio, books: [book] })
  //       let relationNames = Object.keys(instance.relationships);
  //       expect(instance.relationshipResourceIdentifiers(relationNames)).to.deep.equal({
  //         author: [{ id: 1, type: 'authors' }],
  //         books: [{ id: 1, type: 'books' }],
  //         bio: [{ id: 1, type: 'bios' }]
  //       });
  //     });

  //     it('does not contain identifiers without ids', function() {
  //       let book1 = new Book({ id: 1 });
  //       let book2 = new Book();
  //       book1.isPersisted(true);
  //       instance = new RelationGraph({ books: [book1, book2] });
  //       let relationNames = Object.keys(instance.relationships);
  //       expect(instance.relationshipResourceIdentifiers(relationNames)).to.deep.equal({
  //         books: [{ id: 1, type: 'books' }]
  //       });
  //     });
  //   });
  // });
})

// let instance;
// Config.setup();

// describe('Model', function() {

//   describe('.getJWTOwner', function() {
//     it('it finds the furthest ancestor where isJWTOwner', function() {
//       expect(Author.getJWTOwner()).to.eq(ApplicationRecord);
//       expect(Person.getJWTOwner()).to.eq(ApplicationRecord);
//       expect(ApplicationRecord.getJWTOwner()).to.eq(ApplicationRecord);
//       expect(TestJWTSubclass.getJWTOwner()).to.eq(TestJWTSubclass);
//     });

//     describe('when no owner', function() {
//       it('returns null', function() {
//         expect(NonJWTOwner.getJWTOwner()).to.eq(undefined)
//       });
//     });
//   });

//   describe('.url', function() {
//     context('Default base URL generation method', function() {
//       it('should append the baseUrl, apiNamespace, and jsonapi type', function(){
//         class DefaultBaseUrl extends ApplicationRecord {
//           static baseUrl : string = 'http://base.com'
//           static apiNamespace : string = '/namespace/v1'
//           static jsonapiType : string = 'testtype'
//         }

//         expect(DefaultBaseUrl.url('testId')).to.eq('http://base.com/namespace/v1/testtype/testId')
//       })
//     })

//     context('Base URL path generation is overridden', function() {
//       it('should use the result of the override function', function(){
//         class OverriddenBaseUrl extends ApplicationRecord {
//           static jsonapiType : string = 'testtype'
//           static fullBasePath() : string {
//             return 'http://overridden.base'
//           }
//         }

//         expect(OverriddenBaseUrl.url('testId')).to.eq('http://overridden.base/testtype/testId')
//       })
//     })
//   })

//   describe('#getJWT', function() {
//     beforeEach(function() {
//       ApplicationRecord.jwt = 'g3tm3';
//     });

//     afterEach(function() {
//       ApplicationRecord.jwt = null;
//     });

//     it('it grabs jwt from top-most parent', function() {
//       expect(Author.getJWT()).to.eq('g3tm3');
//     });

//     describe('when no JWT owner', function() {
//       it('returns null', function() {
//         expect(NonJWTOwner.getJWT()).to.eq(undefined);
//       });
//     });
//   });

//   describe('#setJWT', function() {
//     afterEach(function() {
//       ApplicationRecord.jwt = null;
//     });

//     it('it sets jwt on the top-most parent', function() {
//       Author.setJWT('n3wt0k3n');
//       expect(ApplicationRecord.jwt).to.eq('n3wt0k3n');
//     });
//   });

//   describe('#fetchOptions', function() {
//     context('jwt is set', function() {
//       beforeEach(function() {
//         ApplicationRecord.jwt = 'g3tm3';
//       });

//       afterEach(function() {
//         ApplicationRecord.jwt = null;
//       });

//       it('sets the auth header', function() {
//         expect(Author.fetchOptions().headers.Authorization).to.eq('Token token="g3tm3"');
//       });
//     })

//     it('includes the content headers', function() {
//       let headers = Author.fetchOptions().headers
//       expect(headers.Accept).to.eq('application/json')
//       expect(headers['Content-Type']).to.eq('application/json')
//     })
//   })


//     describe('when a has-many is marked for destruction', function() {
//       let newDoc, instance, book;

//       beforeEach(function() {
//         book = new Book({ id: '1' });
//         book.isPersisted(true);
//         book.isMarkedForDestruction(true);

//         instance = new Author({ books: [book] });

//         newDoc = {
//           data: {
//             id: '1',
//             type: 'authors'
//           }
//         }
//       });

//       describe('when the relation is part of the include directive', function() {
//         it('is removed from the array', function() {
//           expect(instance.books.length).to.eq(1);
//           instance.fromJsonapi(newDoc.data, newDoc, { books: {} });
//           expect(instance.books.length).to.eq(0);
//         });
//       });

//       describe('when the relation is not part of the include directive', function() {
//         it('is NOT removed from the array', function() {
//           expect(instance.books.length).to.eq(1);
//           instance.fromJsonapi(newDoc.data, newDoc, {});
//           expect(instance.books.length).to.eq(1);
//         });
//       });
//     });

//     describe('when a has-many is marked for disassociation', function() {
//       let newDoc, instance, book;

//       beforeEach(function() {
//         book = new Book({ id: '1' });
//         book.isPersisted(true);
//         book.isMarkedForDisassociation(true);

//         instance = new Author({ books: [book] });

//         newDoc = {
//           data: {
//             id: '1',
//             type: 'authors'
//           }
//         }
//       });

//       describe('when the relation is part of the include directive', function() {
//         it('is removed from the array', function() {
//           expect(instance.books.length).to.eq(1);
//           instance.fromJsonapi(newDoc.data, newDoc, { books: {} });
//           expect(instance.books.length).to.eq(0);
//         });
//       });

//       describe('when the relation is not part of the include directive', function() {
//         it('is NOT removed from the array', function() {
//           expect(instance.books.length).to.eq(1);
//           instance.fromJsonapi(newDoc.data, newDoc, {});
//           expect(instance.books.length).to.eq(1);
//         });
//       });
//     });

//     describe('when a belongs-to is marked for destruction', function() {
//       let newDoc, instance, book;

//       beforeEach(function() {
//         let genre = new Genre({ id: '1' });
//         genre.isPersisted(true);
//         genre.isMarkedForDestruction(true);

//         book = new Book({ id: '1', genre: genre });
//         book.isPersisted(true);

//         instance = new Author({ books: [book] });

//         newDoc = {
//           data: {
//             id: '1',
//             type: 'authors'
//           },
//           relationships: {
//             books: {
//               data: [
//                 { id: '1', type: 'books' }
//               ]
//             }
//           },
//           included: [
//             {
//               id: '1',
//               type: 'books',
//               attributes: { title: 'whatever' }
//             }
//           ]
//         }
//       });

//       it('is set to null', function() {
//         expect(instance.books[0].genre).to.be.instanceof(Genre);
//         instance.fromJsonapi(newDoc.data, newDoc, { books: { genre: {} }});
//         expect(instance.books[0].genre).to.eq(null);
//       });

//       describe('within a nested destruction', function() {
//         beforeEach(function() {
//           book.isMarkedForDestruction(true);
//         });

//         it('is removed via the parent', function() {
//           instance.fromJsonapi(newDoc.data, newDoc, { books: { genre: {} }});
//           expect(instance.books.length).to.eq(0);
//         });
//       });
//     });

//     describe('when a belongs-to is marked for disassociation', function() {
//       let newDoc, instance, book;

//       beforeEach(function() {
//         let genre = new Genre({ id: '1' });
//         genre.isPersisted(true);
//         genre.isMarkedForDisassociation(true);

//         book = new Book({ id: '1', genre: genre });
//         book.isPersisted(true);

//         instance = new Author({ books: [book] });

//         newDoc = {
//           data: {
//             id: '1',
//             type: 'authors'
//           },
//           relationships: {
//             books: {
//               data: [
//                 { id: '1', type: 'books' }
//               ]
//             }
//           },
//           included: [
//             {
//               id: '1',
//               type: 'books',
//               attributes: { title: 'whatever' }
//             }
//           ]
//         }
//       });

//       it('is set to null', function() {
//         expect(instance.books[0].genre).to.be.instanceof(Genre);
//         instance.fromJsonapi(newDoc.data, newDoc, { books: { genre: {} }});
//         expect(instance.books[0].genre).to.eq(null);
//       });

//       describe('within a nested destruction', function() {
//         beforeEach(function() {
//           book.isMarkedForDisassociation(true);
//         });

//         it('is removed via the parent', function() {
//           instance.fromJsonapi(newDoc.data, newDoc, { books: { genre: {} }});
//           expect(instance.books.length).to.eq(0);
//         });
//       });
//     });
//   });


//   describe('changes', function() {
//     describe('when unpersisted', function() {
//       it('counts everything but nulls', function() {
//         instance = new Author({ firstName: 'foo' });
//         expect(instance.changes()).to.deep.equal({
//           firstName: [null, 'foo']
//         });
//       });
//     });

//     describe('when persisted', function() {
//       it('only counts dirty attrs', function() {
//         instance = new Author({ firstName: 'foo' });
//         instance.isPersisted(true);
//         expect(instance.changes()).to.deep.equal({});
//         instance.firstName = 'bar'
//         expect(instance.changes()).to.deep.equal({
//           firstName: ['foo', 'bar']
//         });
//         instance.isPersisted(true);
//         expect(instance.changes()).to.deep.equal({});
//       });
//     });
//   });

//   describe('isDirty', function() {
//     describe('when an attribute changes', function() {
//       it('is marked as dirty', function() {
//         instance = new Author();
//         instance.isPersisted(true);
//         expect(instance.isDirty()).to.eq(false);
//         instance.firstName = 'Joe';
//         expect(instance.isDirty()).to.eq(true);
//         instance.isPersisted(true);
//       });
//     });

//     describe('when not persisted', function() {
//       describe('and no attributes', function() {
//         it('is not dirty', function() {
//           instance = new Author();
//           expect(instance.isDirty()).to.eq(false);
//         });
//       });

//       describe('and has attributes', function() {
//         it('is dirty', function() {
//           instance = new Author({ firstName: 'Stephen' });
//           expect(instance.isDirty()).to.eq(true);
//           instance.isPersisted(true);
//           expect(instance.isDirty()).to.eq(false);
//         });
//       });
//     });

//     describe('when dirty, then persisted', function() {
//       it('is no longer dirty', function() {
//         instance = new Author();
//         instance.firstName = 'foo';
//         expect(instance.isDirty()).to.eq(true);
//       });
//     });

//     describe('when marked for destruction', function() {
//       it('is dirty', function() {
//         instance = new Author();
//         instance.isPersisted(true);
//         expect(instance.isDirty()).to.eq(false);
//         instance.isMarkedForDestruction(true);
//         expect(instance.isDirty()).to.eq(true);
//       });
//     });

//     describe('when marked for disassociation', function() {
//       it('is dirty', function() {
//         instance = new Author();
//         instance.isPersisted(true);
//         expect(instance.isDirty()).to.eq(false);
//         instance.isMarkedForDisassociation(true);
//         expect(instance.isDirty()).to.eq(true);
//       });
//     });

//     describe('when passed relationships', function() {
//       beforeEach(function() {
//         let book = new Book({ id: 1, title: 'original' });
//         instance = new Author({ books: [book] });
//       });

//       it('works with string/object/array include graph', function() {
//         instance.books[0].isPersisted(true);
//         let authorGenre = new Genre({ id: 1 });
//         let bookGenre = new Genre({ id: 2 });
//         authorGenre.isPersisted(true);
//         bookGenre.isPersisted(true);
//         instance.books[0].genre = bookGenre;
//         instance.genre = authorGenre;
//         instance.books[0].isPersisted(true);
//         instance.isPersisted(true);

//         let check = () => {
//           return instance.isDirty(['genre', { books: 'genre' }]);
//         }

//         expect(check()).to.eq(false);
//         instance.genre.name = 'changed';
//         expect(check()).to.eq(true);
//         instance.genre.isPersisted(true);

//         expect(check()).to.eq(false);
//         instance.books[0].title = 'changed';
//         expect(check()).to.eq(true);
//         instance.books[0].isPersisted(true);

//         expect(check()).to.eq(false);
//         instance.books[0].genre.name = 'changed';
//         expect(check()).to.eq(true);
//       });

//       it('is not dirty when relationship not passed, even if relationship is dirty', function() {
//         instance.books[0].isPersisted(true);
//         instance.isPersisted(true);

//         expect(instance.isDirty('genre')).to.eq(false);
//         expect(instance.isDirty('books')).to.eq(false);
//         instance.books[0].title = 'dirty';
//         expect(instance.isDirty('books')).to.eq(true);
//         expect(instance.isDirty('genre')).to.eq(false);
//       });

//       describe('when a hasMany relationship adds a new unpersisted member', function() {
//         it('is dirty', function() {
//           instance.books = [];
//           instance.isPersisted(true);
//           expect(instance.isDirty('books')).to.eq(false);
//           instance.books.push(new Book({ title: 'asdf' }));
//           expect(instance.isDirty('books')).to.eq(true);
//         });
//       });

//       describe('when a hasMany relationship adds a new persisted member', function() {
//         it('is dirty', function() {
//           instance = new Author({ id: 1 });
//           instance.isPersisted(true);
//           instance.books = [];
//           instance.isPersisted(true);
//           expect(instance.isDirty('books')).to.eq(false);
//           let book = new Book({ id: 99 });
//           book.isPersisted(true);
//           instance.books.push(book);

//           expect(instance.isDirty('books')).to.eq(true);
//           instance.isPersisted(true);
//           expect(instance.isDirty('books')).to.eq(false);
//         });
//       });

//       describe('when a belongsTo changes a persisted member', function() {
//         it('is dirty', function() {
//           instance = new Author();
//           let genre = new Genre({ id: 1 });
//           genre.isPersisted(true);
//           let otherGenre = new Genre({ id: 2 });
//           otherGenre.isPersisted(true);

//           instance.genre = genre
//           instance.isPersisted(true);

//           expect(instance.isDirty()).to.eq(false);
//           instance.genre = otherGenre;
//           expect(instance.isDirty('genre')).to.eq(true);
//           expect(instance.isDirty()).to.eq(false);

//           instance.isPersisted(true);
//           expect(instance.isDirty('genre')).to.eq(false);
//         });
//       });

//       describe('when a hasMany relationship has a member marked for destruction', function() {
//         it('is dirty', function() {
//           let book = new Book({ id: 1 });
//           book.isPersisted(true);
//           instance.books = [book];
//           instance.isPersisted(true);

//           expect(instance.isDirty('books')).to.eq(false);
//           book.isMarkedForDestruction(true);
//           expect(instance.isDirty('books')).to.eq(true);
//           expect(instance.isDirty()).to.eq(false);
//         });
//       });

//       describe('when a hasMany relationship has a member marked for disassociation', function() {
//         it('is dirty', function() {
//           let book = new Book({ id: 1 });
//           book.isPersisted(true);
//           instance.books = [book];
//           instance.isPersisted(true);

//           expect(instance.isDirty('books')).to.eq(false);
//           book.isMarkedForDisassociation(true);
//           expect(instance.isDirty('books')).to.eq(true);
//           expect(instance.isDirty()).to.eq(false);
//         });
//       });
//     });
//   });
// });
