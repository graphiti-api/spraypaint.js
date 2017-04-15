import { expect, sinon } from '../test-helper';
import { Model } from '../../src/index';
import { ApplicationRecord, TestJWTSubclass, Person, Author, Book, Genre, Bio } from '../fixtures';

let instance;

describe('Model', function() {
  describe('.getJWTOwner', function() {
    it('it finds the furthest ancestor where isJWTOwner', function() {
      expect(Author.getJWTOwner()).to.eq(ApplicationRecord);
      expect(Person.getJWTOwner()).to.eq(ApplicationRecord);
      expect(ApplicationRecord.getJWTOwner()).to.eq(ApplicationRecord);
      expect(TestJWTSubclass.getJWTOwner()).to.eq(TestJWTSubclass);
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
});
