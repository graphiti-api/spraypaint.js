import { sinon, expect, fetchMock } from '../test-helper';
import { Config } from '../../src/index';
import { ApplicationRecord, Author } from '../fixtures';

after(function () {
  fetchMock.restore();
});

describe.skip('authorization headers', function() {
  describe('when header is set on model class', function() {
    beforeEach(function() {
      ApplicationRecord.jwt = 'myt0k3n';
    });

    afterEach(function() {
      fetchMock.restore();
      ApplicationRecord.jwt = undefined;
    });

    it('is sent in request', function(done) {
      fetchMock.mock((url : string, opts : any) => {
        expect(opts.headers.Authorization).to.eq('Token token="myt0k3n"')
        done();
        return true;
      }, 200);
      Author.find(1);
    });
  });

  describe('when header is NOT returned in response', function() {
    beforeEach(function() {
      fetchMock.get('http://example.com/api/v1/authors', {
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
      ApplicationRecord.jwt = undefined;
    });

    it('does not override the JWT', async function(done) {
      await Author.all()

      expect(ApplicationRecord.jwt).to.eq('dont change me');
    });
  });

  describe('when header is returned in response', function() {
    beforeEach(function() {
      fetchMock.mock({
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
      ApplicationRecord.jwt = undefined;
    });

    it('is used in subsequent requests', function(done) {
      Author.all().then((response) => {
        fetchMock.restore();

        fetchMock.mock((url, opts : any) => {
          expect(opts.headers.Authorization).to.eq('Token token="somet0k3n"')
          done();
          return true;
        }, 200);
        expect(Author.getJWT()).to.eq('somet0k3n');
        expect(ApplicationRecord.jwt).to.eq('somet0k3n');
        Author.all();
      });
    });

    describe('local storage', function() {
      beforeEach(function() {
        Config.localStorage = { setItem: sinon.spy() }
        Config.jwtLocalStorage = 'jwt';
      });

      afterEach(function() {
        Config.localStorage = undefined;
        Config.jwtLocalStorage = false;
      });

      describe('when configured to store jwt', function() {
        beforeEach(function() {
          Config.jwtLocalStorage = 'jwt';
        });

        it('updates localStorage on server response', function(done) {
          Author.all().then((response) => {
            let called = Config.localStorage.setItem
              .calledWith('jwt', 'somet0k3n');
            expect(called).to.eq(true);
            done();
          });
        });

        it('uses the new jwt in subsequent requests', function(done) {
          Author.all().then((response) => {
            fetchMock.restore();

            fetchMock.mock((url, opts : any) => {
              expect(opts.headers.Authorization).to.eq('Token token="somet0k3n"')
              done();
              return true;
            }, 200);
            expect(Author.getJWT()).to.eq('somet0k3n');
            expect(ApplicationRecord.jwt).to.eq('somet0k3n');
            Author.all();
          });
        });

        describe('when JWT is already in localStorage', function() {
          beforeEach(function() {
            fetchMock.restore();
            Config.localStorage['getItem'] = sinon.stub().returns('myt0k3n');
            // configSetup({ jwtLocalStorage: 'jwt' });
          });

          afterEach(function() {
            // configSetup();
          });

          it('sends it in initial request', async function() {
            fetchMock.mock((url : string , opts : any) => {
              expect(opts.headers.Authorization).to.eq('Token token="myt0k3n"')
              // done();
              return true;
            }, 200);

            await Author.find(1);
          });
        });
      });

      describe('when configured to NOT store jwt', function() {
        beforeEach(function() {
          Config.jwtLocalStorage = false;
        });

        it('is does NOT update localStorage on server response', async function() {
          await Author.all()

          let called = Config.localStorage.setItem.called;
          expect(called).to.eq(false);
        });
      });
    });
  });

  describe('a write request', function() {
    beforeEach(function() {
      fetchMock.mock({
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
      ApplicationRecord.jwt = undefined;
    });

    it('also refreshes the jwt', function(done) {
      let author = new Author({ firstName: 'foo' });
      author.save().then(() => {
        expect(ApplicationRecord.jwt).to.eq('somet0k3n');
        done();
      });
    });
  });
});
