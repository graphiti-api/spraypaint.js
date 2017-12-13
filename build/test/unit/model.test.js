"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('Model', function () {
    describe('Initialization', function () {
    });
    describe('Initialization', function () {
    });
});
// import {
//   ApplicationRecord,
//   TestJWTSubclass,
//   NonJWTOwner,
//   Person,
//   Author,
//   Book,
//   Genre,
//   Bio
// } from '../fixtures';
// let instance;
// class RelationGraph extends ApplicationRecord {
//   author = belongsTo('authors')
//   books = hasMany()
//   bio = hasOne('bios')
// }
// Config.setup();
// describe('Model', function() {
//   describe('relationshipResourceIdentifiers', function() {
//     describe('when no relations set', function() {
//       it('is empty', function() {
//         instance = new RelationGraph();
//         let relationNames = Object.keys(instance.relationships);
//         expect(instance.relationshipResourceIdentifiers(relationNames))
//           .to.deep.equal({});
//       });
//     });
//     describe('when relations set', function() {
//       it('returns correct object', function() {
//         let author = new Author({ id: 1 });
//         author.isPersisted(true);
//         let book = new Book({ id: 1 });
//         book.isPersisted(true);
//         let bio = new Bio({ id: 1 });
//         bio.isPersisted(true);
//         instance = new RelationGraph({ author, bio, books: [book] })
//         let relationNames = Object.keys(instance.relationships);
//         expect(instance.relationshipResourceIdentifiers(relationNames)).to.deep.equal({
//           author: [{ id: 1, type: 'authors' }],
//           books: [{ id: 1, type: 'books' }],
//           bio: [{ id: 1, type: 'bios' }]
//         });
//       });
//       it('does not contain identifiers without ids', function() {
//         let book1 = new Book({ id: 1 });
//         let book2 = new Book();
//         book1.isPersisted(true);
//         instance = new RelationGraph({ books: [book1, book2] });
//         let relationNames = Object.keys(instance.relationships);
//         expect(instance.relationshipResourceIdentifiers(relationNames)).to.deep.equal({
//           books: [{ id: 1, type: 'books' }]
//         });
//       });
//     });
//   });
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
//   describe('#isType', function() {
//     it('checks the jsonapiType of class', function() {
//       instance = new Author()
//       expect(instance.isType('authors')).to.eq(true)
//       expect(instance.isType('people')).to.eq(false)
//     });
//   });
//   describe('#fromJsonapi', function() {
//     let doc = {
//       data: {
//         id: '1',
//         type: 'authors',
//         attributes: {
//           firstName: 'Donald Budge',
//           unknown: 'adsf',
//           nilly: null
//         },
//         relationships: {
//           unknownrelationship: {
//             data: {
//               id: '1',
//               type: 'unknowns'
//             }
//           },
//           multi_words: {
//             data: [{
//               id: '1',
//               type: 'multi_words'
//             }]
//           },
//           tags: {},
//           genre: {
//             data: {
//               id: '1',
//               type: 'genres'
//             }
//           },
//           books: {
//             data: [{
//               id: '1',
//               type: 'books'
//             }, {
//               id: '2',
//               type: 'books'
//             }]
//           },
//           special_books: {
//             data: [{
//               id: '3',
//               type: 'books'
//             }]
//           },
//           bio: {
//             data: {
//               id: '1',
//               type: 'bios'
//             }
//           }
//         },
//         meta: {
//           big: true
//         }
//       },
//       included: [
//         {
//           type: 'books',
//           id: '1',
//           attributes: {
//             title: "Where's My Butt?"
//           },
//           relationships: {
//             author: {
//               data: {
//                 id: '2',
//                 type: 'authors' 
//               },
//             }
//           }
//         },
//         {
//           type: 'books',
//           id: '2',
//           attributes: {
//             title: "Catcher in the Rye"
//           },
//           relationships: {
//             author: {
//               data: { 
//                 id: '2', 
//                 type: 'authors' 
//               },
//             }
//           }
//         },
//         {
//           type: 'books',
//           id: '3',
//           attributes: {
//             title: "Peanut Butter & Cupcake"
//           }
//         },
//         {
//           type: 'genres',
//           id: '1',
//           attributes: {
//             name: "Children's"
//           },
//           relationships: {
//             authors: {
//               data: [
//                 { id: '1', type: 'authors' },
//                 { id: '2', type: 'authors' }
//               ]
//             }
//           }
//         },
//         {
//           type: 'authors',
//           id: '2',
//           attributes: {
//             firstName: 'Maurice Sendak'
//           }
//         },
//         {
//           type: 'bios',
//           id: '1',
//           attributes: {
//             description: 'Some Dude.'
//           }
//         }
//       ]
//     };
//     it('assigns id correctly', function() {
//       let instance = new Author();
//       instance.fromJsonapi(doc.data, doc);
//       expect(instance.id).to.eq('1');
//     });
//     it('instantiates the correct model for jsonapi type', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       expect(instance).to.be.instanceof(Author);
//     });
//     it('assigns attributes correctly', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       expect(instance.firstName).to.eq('Donald Budge');
//       expect(instance.attributes).to.eql({
//         firstName: 'Donald Budge',
//         nilly: null
//       })
//     });
//     it('camelizes relationship names', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       expect(instance.multiWords.length).to.eq(1);
//     });
//     it('does not assign unknown attributes', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       expect(instance).to.not.have.property('unknown');
//     });
//     it('does not assign unknown relationships', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       expect(instance).to.not.have.property('unknownrelationship');
//     });
//     it('does not blow up on null attributes', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       expect(instance.nilly).to.eq(null);
//     });
//     it('assigns metadata correctly', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       expect(instance.__meta__).to.eql({
//         big: true
//       })
//     });
//     it('assigns hasMany relationships correctly', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       expect(instance.books.length).to.eq(2);
//       let book = instance.books[0];
//       expect(book).to.be.instanceof(Book);
//       expect(book.title).to.eq("Where's My Butt?");
//     });
//     it('assigns hasMany relationships with same jsonapiType correctly', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       expect(instance.specialBooks.length).to.eq(1);
//       let book = instance.specialBooks[0];
//       expect(book).to.be.instanceof(Book);
//       expect(book.title).to.eq("Peanut Butter & Cupcake");
//     });
//     it('assigns belongsTo relationships correctly', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       let genre = instance.genre;
//       expect(genre).to.be.instanceof(Genre);
//       expect(genre.name).to.eq("Children's");
//     });
//     it('assigns hasOne relationships correctly', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       let bio = instance.bio;
//       expect(bio).to.be.instanceof(Bio);
//       expect(bio.description).to.eq("Some Dude.");
//     });
//     it('assigns nested relationships correctly', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       let authors = instance.genre.authors;
//       expect(authors.length).to.eq(2);
//       expect(authors[0]).to.be.instanceof(Author);
//       expect(authors[1]).to.be.instanceof(Author);
//       expect(authors[0].firstName).to.eq('Donald Budge');
//       expect(authors[1].firstName).to.eq('Maurice Sendak');
//     });
//     it('assigns duplicated nested relationships correctly', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       let book1 = instance.books[0];
//       let book2 = instance.books[1];
//       expect(book1.author.firstName).to.eq("Maurice Sendak");
//       expect(book2.author.firstName).to.eq("Maurice Sendak");
//     });
//     it('skips relationships without data', function() {
//       let instance = Model.fromJsonapi(doc.data, doc);
//       expect(instance.tags).to.eql([]);
//     });
//     it('preserves other properties on the object', function() {
//       let instance = new Author({ id: '1' });
//       instance['fooble'] = 'bar';
//       let same = instance.fromJsonapi(doc.data, doc);
//       expect(same).to.eq(instance);
//       expect(instance.id).to.eq('1');
//       expect(instance.firstName).to.eq('Donald Budge');
//       expect(instance['fooble']).to.eq('bar');
//     });
//     it('preserves other properties on relationships', function() {
//       let genre = new Genre({ id: '1' });
//       genre['bar'] = 'baz';
//       let book = new Book({ id: '1', genre: genre });
//       book['foo'] = 'bar';
//       let instance = new Author({ id: '1', books: [book] });
//       instance.fromJsonapi(doc.data, doc);
//       expect(instance.books[0]).to.eq(book);
//       expect(instance.books[0].genre).to.eq(genre);
//       expect(book.title).to.eq("Where's My Butt?");
//       expect(book['foo']).to.eq('bar');
//       expect(genre['bar']).to.eq('baz');
//     });
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
//   describe('isMarkedForDestruction', function() {
//     it('toggles correctly', function() {
//       instance = new Author();
//       expect(instance.isMarkedForDestruction()).to.eq(false)
//       instance.isMarkedForDestruction(true);
//       expect(instance.isMarkedForDestruction()).to.eq(true)
//       instance.isMarkedForDestruction(false);
//       expect(instance.isMarkedForDestruction()).to.eq(false)
//     });
//   });
//   describe('isMarkedForDisassociation', function() {
//     it('toggles correctly', function() {
//       instance = new Author();
//       expect(instance.isMarkedForDisassociation()).to.eq(false)
//       instance.isMarkedForDisassociation(true);
//       expect(instance.isMarkedForDisassociation()).to.eq(true)
//       instance.isMarkedForDisassociation(false);
//       expect(instance.isMarkedForDisassociation()).to.eq(false)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvdW5pdC9tb2RlbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsUUFBUSxDQUFDLE9BQU8sRUFBRTtJQUNoQixRQUFRLENBQUMsZ0JBQWdCLEVBQUU7SUFFM0IsQ0FBQyxDQUFDLENBQUE7SUFFRixRQUFRLENBQUMsZ0JBQWdCLEVBQUU7SUFFM0IsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQTtBQUVGLFdBQVc7QUFDWCx1QkFBdUI7QUFDdkIscUJBQXFCO0FBQ3JCLGlCQUFpQjtBQUNqQixZQUFZO0FBQ1osWUFBWTtBQUNaLFVBQVU7QUFDVixXQUFXO0FBQ1gsUUFBUTtBQUNSLHdCQUF3QjtBQUV4QixnQkFBZ0I7QUFFaEIsa0RBQWtEO0FBQ2xELGtDQUFrQztBQUNsQyxzQkFBc0I7QUFDdEIseUJBQXlCO0FBQ3pCLElBQUk7QUFDSixrQkFBa0I7QUFFbEIsaUNBQWlDO0FBQ2pDLDZEQUE2RDtBQUM3RCxxREFBcUQ7QUFDckQsb0NBQW9DO0FBQ3BDLDBDQUEwQztBQUMxQyxtRUFBbUU7QUFDbkUsMEVBQTBFO0FBQzFFLGdDQUFnQztBQUNoQyxZQUFZO0FBQ1osVUFBVTtBQUVWLGtEQUFrRDtBQUNsRCxrREFBa0Q7QUFDbEQsOENBQThDO0FBQzlDLG9DQUFvQztBQUNwQywwQ0FBMEM7QUFDMUMsa0NBQWtDO0FBQ2xDLHdDQUF3QztBQUN4QyxpQ0FBaUM7QUFDakMsdUVBQXVFO0FBQ3ZFLG1FQUFtRTtBQUNuRSwwRkFBMEY7QUFDMUYsa0RBQWtEO0FBQ2xELCtDQUErQztBQUMvQywyQ0FBMkM7QUFDM0MsY0FBYztBQUNkLFlBQVk7QUFFWixvRUFBb0U7QUFDcEUsMkNBQTJDO0FBQzNDLGtDQUFrQztBQUNsQyxtQ0FBbUM7QUFDbkMsbUVBQW1FO0FBQ25FLG1FQUFtRTtBQUNuRSwwRkFBMEY7QUFDMUYsOENBQThDO0FBQzlD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