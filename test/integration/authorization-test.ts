import '../../test/test-helper';
import { ApplicationRecord, Author } from '../fixtures';

let fetchMock = require('fetch-mock');

after(function () {
  fetchMock.restore();
});

describe('authorization headers', function() {
  describe('when header is set on model class', function() {
    beforeEach(function() {
      ApplicationRecord.jwt = 'myt0k3n';
    });

    afterEach(function() {
      fetchMock.restore();
      ApplicationRecord.jwt = null;
    });

    it('is sent in request', function(done) {
      fetchMock.mock((url, opts) => {
        expect(opts.headers.Authorization).to.eq('Token token="myt0k3n"')
        done();
        return true;
      }, 200);
      Author.find(1);
    });
  });

  describe('when header is NOT returned in response', function() {
    beforeEach(function() {
      fetchMock.get('http://example.com/api/v1/people', {
        data: [
          {
            id: '1',
            type: 'people',
            attributes: {
              name: 'John'
            }
          }
        ]
      });

      ApplicationRecord.jwt = 'dont change me';
    });

    afterEach(function() {
      fetchMock.restore();
      ApplicationRecord.jwt = null;
    });

    it('does not override the JWT', function(done) {
      Author.all().then((response) => {
        expect(ApplicationRecord.jwt).to.eq('dont change me');
        done();
      });
    });
  });

  describe('when header is returned in response', function() {
    beforeEach(function() {
      fetchMock.mock({
        name: 'route',
        matcher: '*',
        response: {
          status: 200,
          body: { data: [] },
          headers: {
            'X-JWT': 'somet0k3n'
          }
        }
      });
    });

    afterEach(function() {
      fetchMock.restore();
      ApplicationRecord.jwt = null;
    });

    it('is used in subsequent requests', function(done) {
      Author.all().then((response) => {
        fetchMock.restore();

        fetchMock.mock((url, opts) => {
          expect(opts.headers.Authorization).to.eq('Token token="somet0k3n"')
          done();
          return true;
        }, 200);
        expect(Author.getJWT()).to.eq('somet0k3n');
        expect(ApplicationRecord.jwt).to.eq('somet0k3n');
        Author.all();
      });
    });
  });
});
