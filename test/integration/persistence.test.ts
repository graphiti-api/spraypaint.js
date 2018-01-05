import { expect, fetchMock } from '../test-helper';
import { Person, PersonWithExtraAttr } from '../fixtures';

after(function () {
  fetchMock.restore();
});

let instance : Person
let payloads : Array<JsonapiRequestDoc>
let putPayloads : Array<JsonapiRequestDoc>
let deletePayloads : Array<object>
let serverResponse : JsonapiResponseDoc

beforeEach(function() {
  payloads = [];
  putPayloads = [];
  deletePayloads = [];
  instance = new Person();
  serverResponse = {
    data: {
      id: '1',
      type: 'employees',
      attributes: { first_name: 'Joe' }
    }
  }
});

const resetMocks = function() {
  fetchMock.restore();

  fetchMock.post('http://example.com/api/v1/people', function(url, payload : any) {
    payloads.push(JSON.parse(payload.body));
    return serverResponse;
  });

  fetchMock.put('http://example.com/api/v1/people/1', function(url, payload : any) {
    putPayloads.push(JSON.parse(payload.body));
    return serverResponse;
  });

  fetchMock.delete('http://example.com/api/v1/people/1', function(url, payload : any) {
    deletePayloads.push({});
    return serverResponse;
  });
}

describe('Model persistence', function() {
  beforeEach(function () {
    resetMocks();
  });

  describe('#save()', function() {
    describe('when an unpersisted attr', function() {
      it('does not send the attr to server', async function() {
        instance = new PersonWithExtraAttr({ extraThing: 'foo' });
        expect((<PersonWithExtraAttr>instance).extraThing).to.eq('foo');

        await instance.save()

        expect((<any>payloads[0]).data.attributes).to.eq(undefined);
      });
    });

    describe('when the model is already persisted', function() {
      beforeEach(function() {
        instance.id = '1';
        instance.isPersisted = true;
      });

      it('updates instead of creates', async function() {
        instance.firstName = 'Joe';
        await instance.save()

        expect(putPayloads[0]).to.deep.equal({
          data: {
            id: '1',
            type: 'people',
            attributes: {
              first_name: 'Joe',
            }
          }
        });
      });

      it('preserves persistence data', async function() {
        instance.firstName = 'Joe';
        let bool = await instance.save()

        expect(bool).to.eq(true);
        expect(instance.id).to.eq('1');
        expect(instance.isPersisted).to.eq(true);
      });

      describe('when no dirty attributes', function() {
        beforeEach(function() {
          instance.firstName = 'Joe';
          instance.isPersisted = true;
        });

        it('does not send attributes to the server', async function() {
          await instance.save()

          expect(putPayloads[0]).to.deep.equal({
            data: {
              id: '1',
              type: 'people'
            }
          });
        });
      })
    });

    describe('when the model is not already persisted', function() {
      it('makes the correct HTTP call', async function() {
        instance.firstName = 'Joe';
        await instance.save()

        expect(payloads[0]).to.deep.equal({
          data: {
            type: 'people',
            attributes: {
              first_name: 'Joe',
            }
          }
        });
      });

      describe('when the response is 200', function() {
        it('marks the instance as persisted', async function() {
          expect(instance.isPersisted).to.eq(false);

          await instance.save()

          expect(instance.isPersisted).to.eq(true);
        });

        it('sets the id of the record', async function() {
          expect(instance.isPersisted).to.eq(false);

          await instance.save()

          expect(instance.id).to.eq('1');
        });

        it('resolve the promise to true', async function() {
          let bool = await instance.save()

          expect(bool).to.eq(true);
        });

        it('updates attributes set by the server', async function() {
          serverResponse = {
            data: {
              id: '1',
              type: 'employees',
              attributes: {
                first_name: 'From Server'
              }
            }
          }
          instance.firstName = 'From Client';

          await instance.save()

          expect(instance.firstName).to.eq('From Server');
        });
      });

      describe('when the response is 500', function() {
        beforeEach(function () {
          fetchMock.restore();

          fetchMock.mock({
            matcher: 'http://example.com/api/v1/people',
            response: { status: 500, body: { errors: [] } }
          });
        });

        afterEach(function() {
          resetMocks();
        });

        it('rejects the promise', async function() {
          try {
            await instance.save()
          } catch(err) {
            expect(err.message).to.eq('Server Error');
          }
        });
      });

      describe('when the response is 422', function() {
        beforeEach(function () {
          fetchMock.restore();

          fetchMock.mock({
            matcher: 'http://example.com/api/v1/people',
            response: { status: 422, body: { errors: [] } }
          });
        });

        afterEach(function() {
          resetMocks();
        });

        it('does not mark the instance as persisted', async function() {
          await instance.save()

          expect(instance.isPersisted).to.eq(false);
        });

        it('resolves the promise to false', async function() {
          let bool = await instance.save()

          expect(bool).to.eq(false);
        });
      });

      describe('when an attribute is explicitly set as null', function() {
        it('sends the attribute as part of the payload', async function() {
          instance.firstName = 'Joe';
          instance.lastName = null;

          await instance.save()

          expect(payloads[0]).to.deep.equal({
            data: {
              type: 'people',
              attributes: {
                first_name: 'Joe',
                last_name: null
              }
            }
          });
        });
      });
    });
  });

  describe('#destroy', function() {
    beforeEach(function() {
      instance.id = '1';
      instance.isPersisted = true;
    });

    it('makes correct DELETE request', async function() {
      await instance.destroy()

      expect(deletePayloads.length).to.eq(1);
    });

    it('marks object as not persisted', async function() {
      expect(instance.isPersisted).to.eq(true);
      await instance.destroy()

      expect(instance.isPersisted).to.eq(false);
    });

    describe('when the server returns 422', function() {
      beforeEach(function () {
        fetchMock.restore();

        fetchMock.mock({
          matcher: 'http://example.com/api/v1/people/1',
          response: { status: 422, body: { errors: [] } }
        });
      });

      afterEach(function() {
        resetMocks();
      });

      it('does not mark the object as unpersisted', async function() {
        await instance.destroy()

        expect(instance.isPersisted).to.eq(true);
      });
    });

    describe('when the server returns 500', function() {
      beforeEach(function () {
        fetchMock.restore();

        fetchMock.mock({
          matcher: 'http://example.com/api/v1/people/1',
          response: { status: 500, body: { errors: [] } }
        });
      });

      afterEach(function() {
        resetMocks();
      });

      it('rejects the promise', async function() {
        try {
          await instance.destroy()
        } catch(err) {
          expect(err.message).to.eq('Server Error');
        }
      });
    });
  });
});
