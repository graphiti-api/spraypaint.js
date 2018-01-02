import { expect, fetchMock } from '../test-helper';
import { Author, NonFictionAuthor } from '../fixtures';

let resultData = function(promise) {
  return promise.then(function(proxyObject) {
    return proxyObject.data;
  });
};

let generateMockResponse = function(type: string) {
  return {
    data: {
      id: '1',
      type: type,
      attributes: {
        firstName: 'John'
      },
      relationships: {
        books: {
          data: [
            {
              id: 'book1',
              type: 'books'
            }
          ]
        },
        multi_words: {
          data: [
            {
              id: 'multi_word1',
              type: 'multi_words'
            }
          ]
        }
      }
    },
    included: [
      {
        id: 'book1',
        type: 'books',
        attributes: {
          title: 'The Shining'
        }
      },
      {
        id: 'multi_word1',
        type: 'multi_words',
        attributes: {}
      }
    ]
  };
};

describe.skip('Relations', function() {
  describe('#find()', function() {
    beforeEach(function() {
      fetchMock.get('http://example.com/api/v1/authors/1?include=books,multi_words', generateMockResponse('authors'));
    });

    afterEach(fetchMock.restore);

    it('correctly includes relationships', function(done) {
      resultData(Author.includes(['books', 'multi_words']).find(1)).then(data => {
        expect(data.multiWords).to.be.an('array');
        expect(data.books).to.be.an('array');

        done();
      });
    });

    it('contains the right records for each relationship', function(done) {
      resultData(Author.includes(['books', 'multi_words']).find(1)).then(data => {
        expect(data.books[0].title).to.eql('The Shining');
        expect(data.multiWords[0].id).to.eql('multi_word1');

        done();
      });
    });
  });

  describe('when camelizeKeys is false', function() {
    beforeEach(function() {
      fetchMock.get(
        'http://example.com/api/v1/non_fiction_authors/1?include=books,multi_words',
        generateMockResponse('non_fiction_authors')
      );
    });

    afterEach(fetchMock.restore);

    it("Doesn't convert relationships to snake_case if camelization is off", function(done) {
      resultData(NonFictionAuthor.includes(['books', 'multi_words']).find(1))
        .then(data => {
          expect(data.multi_words[0].id).to.eql('multi_word1');

          done();
        })
        .catch(done);
    });
  });
});
