import { expect, sinon, fetchMock } from '../test-helper';
import { Author, Book, Genre } from '../fixtures';
import uuid from '../../src/util/uuid';

let serverResponse;

const resetMocks = function() {
  fetchMock.restore();

  fetchMock.mock({
    matcher: '*',
    response: {
      status: 422,
      body: {
        errors: [
          {
            code: 'unprocessable_entity',
            status: '422',
            title: 'Validation Error',
            detail: 'First Name cannot be blank',
            meta: { attribute: 'first_name', message: 'cannot be blank' }
          },
          {
            code: 'unprocessable_entity',
            status: '422',
            title: 'Validation Error',
            detail: 'Last Name cannot be blank',
            meta: { attribute: 'last_name', message: 'cannot be blank' }
          },
          {
            code: 'unprocessable_entity',
            status: '422',
            title: 'Validation Error',
            detail: 'Title cannot be blank',
            meta: {
              relationship: {
                name: 'books',
                type: 'books',
                ['temp-id']: 'abc1',
                attribute: 'title',
                message: 'cannot be blank'
              }
            }
          },
          {
            code: 'unprocessable_entity',
            status: '422',
            title: 'Validation Error',
            detail: 'Name cannot be blank',
            meta: {
              relationship: {
                name: 'books',
                type: 'books',
                ['temp-id']: 'abc1',
                relationship: {
                  name: 'genre',
                  type: 'genres',
                  id: '1',
                  attribute: 'name',
                  message: 'cannot be blank'
                }
              }
            }
          }
        ]
      }
    }
  });

  fetchMock.post('http://example.com/api/v1/people', function(url, payload) {
    return serverResponse;
  });
}

let instance;
let tempIdIndex = 0;
describe('validations', function() {
  beforeEach(function () {
    resetMocks();
  });

  beforeEach(function() {
    sinon.stub(uuid, 'generate').callsFake(function() {
      tempIdIndex++
      return `abc${tempIdIndex}`;
    });

    instance = new Author({ lastName: 'King' });
    let genre = new Genre({ id: '1' });
    genre.isPersisted(true);
    let book = new Book({ title: 'blah', genre });
    instance.books = [book]
  });

  afterEach(function() {
    tempIdIndex = 0;
    uuid.generate['restore']();
  });

  // todo on next save, remove errs
  it('applies errors to the instance', function(done) {
    instance.save({ with: { books: 'genre' }}).then((success) => {
      expect(instance.isPersisted()).to.eq(false);
      expect(success).to.eq(false);
      expect(instance.errors).to.deep.equal({
        first_name: 'cannot be blank',
        last_name: 'cannot be blank'
      });
      done();
    });
  });

  it('applies errors to nested hasMany relationships', function(done) {
    instance.save({ with: { books: 'genre' }}).then((success) => {
      expect(instance.isPersisted()).to.eq(false);
      expect(success).to.eq(false);
      expect(instance.books[0].errors).to.deep.equal({
        title: 'cannot be blank',
      });
      done();
    });
  });

  it('applies errors to nested belongsTo relationships', function(done) {
    instance.save({ with: { books: 'genre' }}).then((success) => {
      expect(instance.isPersisted()).to.eq(false);
      expect(success).to.eq(false);
      console.log(instance.books[0].genre.errors)
      expect(instance.books[0].genre.errors).to.deep.equal({
        name: 'cannot be blank',
      });
      done();
    });
  });
});
