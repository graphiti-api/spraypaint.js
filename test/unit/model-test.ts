import { expect, sinon } from '../test-helper';
import { Config, Model, belongsTo, hasMany, hasOne } from '../../src/index';
import {
  ApplicationRecord,
  TestJWTSubclass,
  NonJWTOwner,
  Person,
  Author,
  Book,
  Genre,
  Bio
} from '../fixtures';

let instance;

class RelationGraph extends ApplicationRecord {
  author = belongsTo('authors')
  books = hasMany()
  bio = hasOne('bios')
}
Config.setup();

describe('Model', function() {
  describe('relationshipResourceIdentifiers', function() {
    describe('when no relations set', function() {
      it('is empty', function() {
        instance = new RelationGraph();
        let relationNames = Object.keys(instance.relationships);
        expect(instance.relationshipResourceIdentifiers(relationNames))
          .to.deep.equal({});
      });
    });

    describe('when relations set', function() {
      it('returns correct object', function() {
        let author = new Author({ id: 1 });
        author.isPersisted(true);
        let book = new Book({ id: 1 });
        book.isPersisted(true);
        let bio = new Bio({ id: 1 });
        bio.isPersisted(true);
        instance = new RelationGraph({ author, bio, books: [book] })
        let relationNames = Object.keys(instance.relationships);
        expect(instance.relationshipResourceIdentifiers(relationNames)).to.deep.equal({
          author: [{ id: 1, type: 'authors' }],
          books: [{ id: 1, type: 'books' }],
          bio: [{ id: 1, type: 'bios' }]
        });
      });

      it('does not contain identifiers without ids', function() {
        let book1 = new Book({ id: 1 });
        let book2 = new Book();
        book1.isPersisted(true);
        instance = new RelationGraph({ books: [book1, book2] });
        let relationNames = Object.keys(instance.relationships);
        expect(instance.relationshipResourceIdentifiers(relationNames)).to.deep.equal({
          books: [{ id: 1, type: 'books' }]
        });
      });
    });
  });

  describe('.getJWTOwner', function() {
    it('it finds the furthest ancestor where isJWTOwner', function() {
      expect(Author.getJWTOwner()).to.eq(ApplicationRecord);
      expect(Person.getJWTOwner()).to.eq(ApplicationRecord);
      expect(ApplicationRecord.getJWTOwner()).to.eq(ApplicationRecord);
      expect(TestJWTSubclass.getJWTOwner()).to.eq(TestJWTSubclass);
    });

    describe('when no owner', function() {
      it('returns null', function() {
        expect(NonJWTOwner.getJWTOwner()).to.eq(undefined)
      });
    });
  });

  describe('#getJWT', function() {
    beforeEach(function() {
      ApplicationRecord.jwt = 'g3tm3';
    });

    afterEach(function() {
      ApplicationRecord.jwt = null;
    });

    it('it grabs jwt from top-most parent', function() {
      expect(Author.getJWT()).to.eq('g3tm3');
    });

    describe('when no JWT owner', function() {
      it('returns null', function() {
        expect(NonJWTOwner.getJWT()).to.eq(undefined);
      });
    });
  });

  describe('#setJWT', function() {
    afterEach(function() {
      ApplicationRecord.jwt = null;
    });

    it('it sets jwt on the top-most parent', function() {
      Author.setJWT('n3wt0k3n');
      expect(ApplicationRecord.jwt).to.eq('n3wt0k3n');
    });
  });

  describe('#isType', function() {
    it('checks the jsonapiType of class', function() {
      instance = new Author()
      expect(instance.isType('authors')).to.eq(true)
      expect(instance.isType('people')).to.eq(false)
    });
  });

  describe('#fromJsonapi', function() {
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

    it('assigns id correctly', function() {
      let instance = Model.fromJsonapi(doc.data, doc);
      expect(instance.id).to.eq('1');
    });

    it('instantiates the correct model for jsonapi type', function() {
      let instance = Model.fromJsonapi(doc.data, doc);
      expect(instance).to.be.instanceof(Author);
    });

    it('assigns attributes correctly', function() {
      let instance = Model.fromJsonapi(doc.data, doc);
      expect(instance.firstName).to.eq('Donald Budge');
      expect(instance.attributes).to.eql({
        firstName: 'Donald Budge',
        nilly: null
      })
    });

    it('camelizes relationship names', function() {
      let instance = Model.fromJsonapi(doc.data, doc);
      expect(instance.multiWords.length).to.eq(1);
    });

    it('does not assign unknown attributes', function() {
      let instance = Model.fromJsonapi(doc.data, doc);
      expect(instance).to.not.have.property('unknown');
    });

    it('does not assign unknown relationships', function() {
      let instance = Model.fromJsonapi(doc.data, doc);
      expect(instance).to.not.have.property('unknownrelationship');
    });

    it('does not blow up on null attributes', function() {
      let instance = Model.fromJsonapi(doc.data, doc);
      expect(instance.nilly).to.eq(null);
    });

    it('assigns metadata correctly', function() {
      let instance = Model.fromJsonapi(doc.data, doc);
      expect(instance.__meta__).to.eql({
        big: true
      })
    });

    it('assigns hasMany relationships correctly', function() {
      let instance = Model.fromJsonapi(doc.data, doc);
      expect(instance.books.length).to.eq(1);
      let book = instance.books[0];
      expect(book).to.be.instanceof(Book);
      expect(book.title).to.eq("Where's My Butt?");
    });

    it('assigns belongsTo relationships correctly', function() {
      let instance = Model.fromJsonapi(doc.data, doc);
      let genre = instance.genre;
      expect(genre).to.be.instanceof(Genre);
      expect(genre.name).to.eq("Children's");
    });

    it('assigns hasOne relationships correctly', function() {
      let instance = Model.fromJsonapi(doc.data, doc);
      let bio = instance.bio;
      expect(bio).to.be.instanceof(Bio);
      expect(bio.description).to.eq("Some Dude.");
    });

    it('assigns nested relationships correctly', function() {
      let instance = Model.fromJsonapi(doc.data, doc);
      let authors = instance.genre.authors;
      expect(authors.length).to.eq(2);
      expect(authors[0]).to.be.instanceof(Author);
      expect(authors[1]).to.be.instanceof(Author);
      expect(authors[0].firstName).to.eq('Donald Budge');
      expect(authors[1].firstName).to.eq('Maurice Sendak');
    });

    it('skips relationships without data', function() {
      let instance = Model.fromJsonapi(doc.data, doc);
      expect(instance.tags).to.eql([]);
    });
  });

  describe('isMarkedForDestruction', function() {
    it('toggles correctly', function() {
      instance = new Author();
      expect(instance.isMarkedForDestruction()).to.eq(false)
      instance.isMarkedForDestruction(true);
      expect(instance.isMarkedForDestruction()).to.eq(true)
      instance.isMarkedForDestruction(false);
      expect(instance.isMarkedForDestruction()).to.eq(false)
    });
  });

  describe('isDirty', function() {
    describe('when an attribute changes', function() {
      it('is marked as dirty', function() {
        instance = new Author();
        instance.isPersisted(true);
        expect(instance.isDirty()).to.eq(false);
        instance.firstName = 'Joe';
        expect(instance.isDirty()).to.eq(true);
        instance.isPersisted(true);
      });
    });

    describe('when not persisted', function() {
      describe('and no attributes', function() {
        it('is not dirty', function() {
          instance = new Author();
          expect(instance.isDirty()).to.eq(false);
        });
      });

      describe('and has attributes', function() {
        it('is dirty', function() {
          instance = new Author({ firstName: 'Stephen' });
          expect(instance.isDirty()).to.eq(true);
          instance.isPersisted(true);
          expect(instance.isDirty()).to.eq(false);
        });
      });
    });

    describe('when dirty, then persisted', function() {
      it('is no longer dirty', function() {
        instance = new Author();
        instance.firstName = 'foo';
        expect(instance.isDirty()).to.eq(true);
      });
    });

    describe('when marked for destruction', function() {
      it('is dirty', function() {
        instance = new Author();
        instance.isPersisted(true);
        expect(instance.isDirty()).to.eq(false);
        instance.isMarkedForDestruction(true);
        expect(instance.isDirty()).to.eq(true);
      });
    });

    describe('when marked for disassociation', function() {
      // disassociations not implemented yet
      xit('is dirty', function() {
      });
    });

    describe('when passed relationships', function() {
      beforeEach(function() {
        let book = new Book({ id: 1, title: 'original' });
        instance = new Author({ books: [book] });
      });

      it('works with string/object/array include graph', function() {
        instance.books[0].isPersisted(true);
        let authorGenre = new Genre({ id: 1 });
        let bookGenre = new Genre({ id: 2 });
        authorGenre.isPersisted(true);
        bookGenre.isPersisted(true);
        instance.books[0].genre = bookGenre;
        instance.genre = authorGenre;
        instance.books[0].isPersisted(true);
        instance.isPersisted(true);

        let check = () => {
          return instance.isDirty(['genre', { books: 'genre' }]);
        }

        expect(check()).to.eq(false);
        instance.genre.name = 'changed';
        expect(check()).to.eq(true);
        instance.genre.isPersisted(true);

        expect(check()).to.eq(false);
        instance.books[0].title = 'changed';
        expect(check()).to.eq(true);
        instance.books[0].isPersisted(true);

        expect(check()).to.eq(false);
        instance.books[0].genre.name = 'changed';
        expect(check()).to.eq(true);
      });

      it('is not dirty when relationship not passed, even if relationship is dirty', function() {
        instance.books[0].isPersisted(true);
        instance.isPersisted(true);

        expect(instance.isDirty('genre')).to.eq(false);
        expect(instance.isDirty('books')).to.eq(false);
        instance.books[0].title = 'dirty';
        expect(instance.isDirty('books')).to.eq(true);
        expect(instance.isDirty('genre')).to.eq(false);
      });

      describe('when a hasMany relationship adds a new unpersisted member', function() {
        it('is dirty', function() {
          instance.books = [];
          instance.isPersisted(true);
          expect(instance.isDirty('books')).to.eq(false);
          instance.books.push(new Book({ title: 'asdf' }));
          expect(instance.isDirty('books')).to.eq(true);
        });
      });

      describe('when a hasMany relationship adds a new persisted member', function() {
        it('is dirty', function() {
          instance = new Author({ id: 1 });
          instance.isPersisted(true);
          instance.books = [];
          instance.isPersisted(true);
          expect(instance.isDirty('books')).to.eq(false);
          let book = new Book({ id: 99 });
          book.isPersisted(true);
          instance.books.push(book);

          expect(instance.isDirty('books')).to.eq(true);
          instance.isPersisted(true);
          expect(instance.isDirty('books')).to.eq(false);
        });
      });

      describe('when a belongsTo changes a persisted member', function() {
        it('is dirty', function() {
          instance = new Author();
          let genre = new Genre({ id: 1 });
          genre.isPersisted(true);
          let otherGenre = new Genre({ id: 2 });
          otherGenre.isPersisted(true);

          instance.genre = genre
          instance.isPersisted(true);

          expect(instance.isDirty()).to.eq(false);
          instance.genre = otherGenre;
          expect(instance.isDirty('genre')).to.eq(true);
          expect(instance.isDirty()).to.eq(false);

          instance.isPersisted(true);
          expect(instance.isDirty('genre')).to.eq(false);
        });
      });

      describe('when a hasMany relationship has a member marked for destruction', function() {
        it('is dirty', function() {
          let book = new Book({ id: 1 });
          book.isPersisted(true);
          instance.books = [book];
          instance.isPersisted(true);

          expect(instance.isDirty('books')).to.eq(false);
          book.isMarkedForDestruction(true);
          expect(instance.isDirty('books')).to.eq(true);
          expect(instance.isDirty()).to.eq(false);
        });
      });
    });
  });
});
