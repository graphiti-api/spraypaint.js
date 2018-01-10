import { sinon, expect, fetchMock } from '../test-helper';
import { SinonSpy } from 'sinon'
import { JSORMBase, Model, Attr } from '../../src/index';
import { StorageBackend } from '../../src/local-storage'

let authorResponse = {
  id: '1',
  type: 'people',
  attributes: {
    name: 'John'
  }
}
let stubFind =  {
  data: authorResponse
}
let stubAll =  {
  data: [authorResponse]
}

let ApplicationRecord : typeof JSORMBase
let Author : typeof JSORMBase

/*
 * This is annoying, but since mocha runs its `beforeEach` blocks from the outside in,
 * there are a couple tests we need to be able to reinstantiate the model classes from 
 * scratch for.  This is because loading JWT from localStorage happens when the model
 * class is created. This means we need to create those classes AFTER the localStorage
 * stubbing has happened. In those tests we will re-run the model instantiation after
 * the stubbing.
 */
const buildModels = () => {
  @Model({
    baseUrl: 'http://example.com',
    apiNamespace: '/api/v1/'
  })
  class Base extends JSORMBase {
  }
  ApplicationRecord = Base
  
  @Model({
    endpoint: 'authors',
    jsonapiType: 'people',
  })
  class A extends ApplicationRecord {
    @Attr nilly : string
  }
  Author = A
}

describe('authorization headers', function() {
  beforeEach(buildModels)

  describe('when header is set on model class', function() {
    beforeEach(function() {
      ApplicationRecord.jwt = 'myt0k3n';
    });

    it('is sent in request', async function() {
      fetchMock.mock((url : string, opts : any) => {
        expect(opts.headers.Authorization).to.eq('Token token="myt0k3n"')
        return true
      }, { status: 200, body: stubFind, sendAsJson: true });

     await Author.find(1)
    });
  });

  describe('when header is set in a custom generateAuthHeader', function() {
    let originalHeaderFn : any
    beforeEach(function() {
      ApplicationRecord.jwt = 'cu570m70k3n';
      originalHeaderFn = Author.generateAuthHeader;
      Author.generateAuthHeader = function(token) {
        return `Bearer ${token}`;
      };
    });

    afterEach(function() {
      Author.generateAuthHeader = originalHeaderFn;
    });

    it("sends the custom Authorization token in the request's headers", async function() {
      fetchMock.mock((url, opts : any) => {
        expect(opts.headers.Authorization).to.eq('Bearer cu570m70k3n');
        return true;
      }, { status: 200, body: stubFind, sendAsJson: true });
      
      await Author.find(1)
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

    it('does not override the JWT', async function() {
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

    it('is used in subsequent requests', async function() {
      await Author.all()
      fetchMock.restore();

      fetchMock.mock((url, opts : any) => {
        expect(opts.headers.Authorization).to.eq('Token token="somet0k3n"')
        return true;
      }, { status: 200, body: stubAll, sendAsJson: true });

      expect(Author.getJWT()).to.eq('somet0k3n');
      expect(ApplicationRecord.jwt).to.eq('somet0k3n');
      await Author.all()
    });

    describe('local storage', function() {
      let localStorageMock : {
        getItem: SinonSpy,
        setItem: SinonSpy,
        removeItem: SinonSpy,
      }

      beforeEach(function() {
        // Clear out model classes sot that each test block must recreate them after doing
        // necessary stubbing. Otherwise we might hide errors by mistake. See above comment 
        // on the buildModels() function for more complete explanation
        ;(<any>ApplicationRecord) = null
        ;(<any>Author) = null

        localStorageMock = { 
          setItem: sinon.spy(),
          getItem: sinon.spy(),
          removeItem: sinon.spy(),
        }
        JSORMBase.localStorageBackend = localStorageMock
      });

      afterEach(function() {
        JSORMBase.localStorageBackend = undefined as any;
        JSORMBase.jwtLocalStorage = false
      });

      describe('when configured to store jwt', function() {
        describe('when JWT is not in localStorage', () => {
          beforeEach(function() {
            JSORMBase.jwtLocalStorage = 'jwt'

            buildModels()
          });

          it('updates localStorage on server response', async function() {
            await Author.all()

            expect(localStorageMock.setItem).to.have.been.calledWith('jwt', 'somet0k3n');
          });

          it('uses the new jwt in subsequent requests', async function() {
            await Author.all()
            fetchMock.restore();

            fetchMock.mock((url, opts : any) => {
              expect(opts.headers.Authorization).to.eq('Token token="somet0k3n"')
              return true;
            }, { status: 200, body: stubAll, sendAsJson: true })
            expect(Author.getJWT()).to.eq('somet0k3n');
            expect(ApplicationRecord.jwt).to.eq('somet0k3n');

            await Author.all();
          });
        })

        describe('when JWT is already in localStorage', function() {
          beforeEach(function() {
            JSORMBase.jwtLocalStorage = 'jwt'
            fetchMock.restore();
            JSORMBase.localStorage.getJWT = sinon.stub().returns('myt0k3n');

            buildModels()
          });

          it('sends it in initial request', async function() {
            fetchMock.mock((url : string , opts : any) => {
              expect(opts.headers.Authorization).to.eq('Token token="myt0k3n"')
              return true;
            }, { status: 200, body: stubFind, sendAsJson: true });

            await Author.find(1)
          });
        });
      });

      describe('when configured to NOT store jwt', function() {
        beforeEach(function() {
          JSORMBase.jwtLocalStorage = false;

          buildModels()
        });

        it('is does NOT update localStorage on server response', async function() {
          await Author.all()

          expect(localStorageMock.setItem).not.to.have.been.called
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

    it('also refreshes the jwt', async function() {
      let author = new Author({ firstName: 'foo' });
      await author.save()

      expect(ApplicationRecord.jwt).to.eq('somet0k3n');
    });
  });

  afterEach(function() {
    fetchMock.restore();
    ApplicationRecord.jwt = undefined;
  });
});

after(function () {
  fetchMock.restore();
});