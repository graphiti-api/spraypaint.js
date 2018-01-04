import { sinon, expect, fetchMock } from '../test-helper';
import { Author, Book, Genre } from '../fixtures';
import tempId from '../../src/util/temp-id';

let instance : Author
let payloads : Array<JsonapiDoc>
let putPayloads : Array<JsonapiDoc>
let deletePayloads : Array<JsonapiDoc>
let serverResponse : JsonapiDoc

type method = 'update' | 'destroy' | 'disassociate'

const resetMocks = function() {
  fetchMock.restore();

  fetchMock.post('http://example.com/api/v1/authors', function(url, payload : any) {
    payloads.push(JSON.parse(payload.body));
    return serverResponse;
  });

  fetchMock.put('http://example.com/api/v1/authors/1', function(url, payload : any) {
    putPayloads.push(JSON.parse(payload.body));
    return serverResponse;
  });

  fetchMock.delete('http://example.com/api/v1/authors/1', function(url, payload : any) {
    deletePayloads.push({});
    return serverResponse;
  });
}

let expectedCreatePayload : JsonapiDoc = {
  data: {
    type: 'authors',
    attributes: { first_name: 'Stephen' },
    relationships: {
      books: {
        data: [
          {
            ['temp-id']: 'abc1',
            type: 'books',
            method: 'create'
          }
        ]
      }
    }
  },
  included: [
    {
      ['temp-id']: 'abc1',
      type: 'books',
      attributes: {
        title: 'The Shining'
      },
      relationships: {
        genre: {
          data: {
            ['temp-id']: 'abc2',
            type: 'genres',
            method: 'create'
          }
        }
      }
    },
    {
      ['temp-id']: 'abc2',
      type: 'genres',
      attributes: {
        name: 'Horror'
      }
    }
  ]
};

let expectedUpdatePayload = function(method : method) : JsonapiDoc {
  return {
    data: {
      id: '1',
      type: 'authors',
      relationships: {
        books: {
          data: [
            {
              id: '10',
              type: 'books',
              method: method
            }
          ]
        }
      }
    },
    included: [
      {
        id: '10',
        type: 'books',
        attributes: {
          title: 'Updated Book Title'
        },
        relationships: {
          genre: {
            data: {
              id: '20',
              type: 'genres',
              method: method
            }
          }
        }
      },
      {
        id: '20',
        type: 'genres',
        attributes: {
          name: 'Updated Genre Name'
        }
      }
    ]
  }
};

const seedPersistedData = function() {
  let genre = new Genre({ id: '20', name: 'Horror' });
  genre.isPersisted = true
  let book = new Book({ id: '10', title: 'The Shining', genre: genre })
  book.isPersisted = true
  instance.id = '1'
  instance.books = [book];
  instance.isPersisted = true;
  genre.name = 'Updated Genre Name';
  book.title = 'Updated Book Title';
}

describe('nested persistence', function() {
  beforeEach(function() {
    payloads = [];
    putPayloads = [];
    deletePayloads = [];
    instance = new Author({ firstName: 'Stephen' });
    serverResponse = {
      data: {
        id: '1',
        type: 'authors',
        attributes: { first_name: 'first name from server' },
        relationships: {
          books: {
            data: [{
              id: '10',
              type: 'books'
            }]
          }
        }
      },
      included: [
        {
          ['temp-id']: 'abc1',
          id: '10',
          type: 'books',
          attributes: { title: 'title from server' },
          relationships: {
            genre: {
              data: {
                id: '20',
                type: 'genres'
              }
            }
          }
        },
        {
          ['temp-id']: 'abc2',
          id: '20',
          type: 'genres',
          attributes: { name: 'name from server' }
        }
      ]
    }
  });

  afterEach(function () {
    fetchMock.restore();
  });

  beforeEach(function () {
    resetMocks();
  });

  let tempIdIndex = 0;
  beforeEach(function() {
    sinon.stub(tempId, 'generate').callsFake(function() {
      tempIdIndex++
      return `abc${tempIdIndex}`;
    });
  });

  afterEach(function() {
    tempIdIndex = 0
    ;(<any>tempId.generate)['restore']()
  });

  describe('basic nested create', function() {
    beforeEach(function() {
      let genre = new Genre({ name: 'Horror' });
      let book = new Book({ title: 'The Shining', genre: genre });
      instance.books = [book];
    });

    // todo test on the way back - id set, attrs updated, isPersisted
    // todo remove #destroy? and just save when markwithpersisted? combo? for ombined payload
    // todo test unique includes/circular relationshio
    it('sends the correct payload', async function() {
      await instance.save({ with: { books: 'genre' } })

      expect(payloads[0]).to.deep.equal(expectedCreatePayload);
    });

    it('assigns ids from the response', async function() {
      await instance.save({ with: { books: 'genre' } })

      expect(instance.id).to.eq('1');
      expect(instance.books[0].id).to.eq('10');
      expect(instance.books[0].genre.id).to.eq('20');
    });

    // Commenting out to avoid thinking something is wrong
    // every time I see a pending test. We may be able to delete this?
    // it('removes old temp ids', async function() {
    //   await instance.save({ with: { books: 'genre' } })

    //   expect(instance.id).to.eq('1');
    //   expect(instance.books[0].temp_id).to.eq(null);
    //   expect(instance.books[0].genre.temp_id).to.eq(null);
    // });

    it('updates attributes with data from server', async function() {
      await instance.save({ with: { books: 'genre' } })

      expect(instance.firstName).to.eq('first name from server');
      expect(instance.books[0].title).to.eq('title from server');
      expect(instance.books[0].genre.name).to.eq('name from server');
    });

    describe('when a hasMany relationship has no dirty members', function() {
      beforeEach(function() {
        instance.books[0] = new Book();
      });

      it('should not be sent in the payload', async function() {
        await instance.save({ with: { books: 'genre' } })
        expect((<any>payloads)[0].data.relationships).to.eq(undefined)
      });
    });
  });

  describe('basic nested update', function() {
    beforeEach(function() {
      seedPersistedData();
    });

    it('sends the correct payload', async function() {
      await instance.save({ with: { books: 'genre' } })

      expect(putPayloads[0]).to.deep.equal(expectedUpdatePayload('update'));
    });
  });

  describe('basic nested destroy', function() {
    beforeEach(function() {
      seedPersistedData();
    });

    it('sends the correct payload', async function() {
      instance.books[0].isMarkedForDestruction = true;
      instance.books[0].genre.isMarkedForDestruction = true;
      await instance.save({ with: { books: 'genre' } })

      expect(putPayloads[0]).to.deep.equal(expectedUpdatePayload('destroy'));
    });

    it('removes the associated has_many data', async function() {
      instance.books[0].isMarkedForDestruction = true;
      await instance.save({ with: 'books' })

      expect(instance.books.length).to.eq(0);
    });

    it('removes the associated belongs_to data', async function() {
      instance.books[0].genre.isMarkedForDestruction = true;
      await instance.save({ with: { books: 'genre' } })

      expect(instance.books[0].genre).to.eq(null);
    });
  });

  describe('basic nested disassociate', function() {
    beforeEach(function() {
      seedPersistedData();
    });

    it('sends the correct payload', async function() {
      instance.books[0].isMarkedForDisassociation = true;
      instance.books[0].genre.isMarkedForDisassociation = true;
      await instance.save({ with: { books: 'genre' } })

      expect(putPayloads[0]).to.deep.equal(expectedUpdatePayload('disassociate'));
    });

    it('removes the associated has_many data', async function() {
      instance.books[0].isMarkedForDisassociation = true;
      await instance.save({ with: 'books' })

      expect(instance.books.length).to.eq(0);
    });

    it('removes the associated belongs_to data', async function() {
      instance.books[0].genre.isMarkedForDisassociation = true;
      await instance.save({ with: { books: 'genre' } })

      expect(instance.books[0].genre).to.eq(null);
    });
  });
});
