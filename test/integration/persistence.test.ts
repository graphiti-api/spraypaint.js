import { expect, fetchMock } from '../test-helper';
import { Person, PersonWithExtraAttr } from '../fixtures';

let fetchMock = require('fetch-mock');

after(function () {
  fetchMock.restore();
});

let instance;
let payloads;
let putPayloads;
let deletePayloads;
let serverResponse;
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

  fetchMock.post('http://example.com/api/v1/people', function(url, payload) {
    payloads.push(JSON.parse(payload.body));
    return serverResponse;
  });

  fetchMock.put('http://example.com/api/v1/people/1', function(url, payload) {
    putPayloads.push(JSON.parse(payload.body));
    return serverResponse;
  });

  fetchMock.delete('http://example.com/api/v1/people/1', function(url, payload) {
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
      it('does not send the attr to server', function(done) {
        instance = new PersonWithExtraAttr({ extraThing: 'foo' });
        expect(instance.extraThing).to.eq('foo');
        instance.save().then(() => {
          expect(payloads[0]['data']['attributes']).to.eq(undefined);
          done()
        });
      });
    });

    describe('when the model is already persisted', function() {
      beforeEach(function() {
        instance.id = '1';
        instance.isPersisted = true;
      });

      it('updates instead of creates', function(done) {
        instance.firstName = 'Joe';
        instance.save().then(() => {
          expect(putPayloads[0]).to.deep.equal({
            data: {
              id: '1',
              type: 'people',
              attributes: {
                first_name: 'Joe',
              }
            }
          });
          done();
        });
      });

      it('preserves persistence data', function() {
        instance.firstName = 'Joe';
        instance.save().then((bool) => {
          expect(bool).to.eq(true);
          expect(instance.id).to.eq('1');
          expect(instance.isPersisted).to.eq(true);
        });
      });

      describe('when no dirty attributes', function() {
        beforeEach(function() {
          instance.firstName = 'Joe';
          instance.isPersisted = true;
        });

        it('does not send attributes to the server', function(done) {
          instance.save().then(() => {
            console.log(putPayloads[0])
            expect(putPayloads[0]).to.deep.equal({
              data: {
                id: '1',
                type: 'people'
              }
            });
            done();
          });
        });
      })
    });

    describe('when the model is not already persisted', function() {
      it('makes the correct HTTP call', function(done) {
        instance.firstName = 'Joe';
        instance.save().then(() => {
          expect(payloads[0]).to.deep.equal({
            data: {
              type: 'people',
              attributes: {
                first_name: 'Joe',
              }
            }
          });
          done();
        });
      });

      describe('when the response is 200', function() {
        it('marks the instance as persisted', function(done) {
          expect(instance.isPersisted).to.eq(false);
          instance.save().then(() => {
            expect(instance.isPersisted).to.eq(true);
            done();
          });
        });

        it('sets the id of the record', function(done) {
          expect(instance.isPersisted).to.eq(false);
          instance.save().then(() => {
            expect(instance.id).to.eq('1');
            done();
          });
        });

        it('resolve the promise to true', function(done) {
          instance.save().then((bool) => {
            expect(bool).to.eq(true);
            done();
          });
        });

        it('updates attributes set by the server', function(done) {
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
          instance.save().then(() => {
            expect(instance.firstName).to.eq('From Server');
            done();
          });
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

        it('rejects the promise', function(done) {
          instance.save().catch((err) => {
            expect(err).to.eq('Server Error');
            done();
          });
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

        it('does not mark the instance as persisted', function(done) {
          instance.save().then((bool) => {
            expect(instance.isPersisted).to.eq(false);
            done();
          });
        });

        it('resolves the promise to false', function(done) {
          instance.save().then((bool) => {
            expect(bool).to.eq(false);
            done();
          });
        });
      });

      describe('when an attribute is explicitly set as null', function() {
        it('sends the attribute as part of the payload', function(done) {
          instance.firstName = 'Joe';
          instance.lastName = null;

          instance.save().then(() => {

            expect(payloads[0]).to.deep.equal({
              data: {
                type: 'people',
                attributes: {
                  first_name: 'Joe',
                  last_name: null
                }
              }
            });
            done();
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

    it('makes correct DELETE request', function(done) {
      instance.destroy().then(() => {
        expect(deletePayloads.length).to.eq(1);
        done();
      });
    });

    it('marks object as not persisted', function(done) {
      expect(instance.isPersisted).to.eq(true);
      instance.destroy().then(() => {
        expect(instance.isPersisted).to.eq(false);
        done();
      });
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

      it('does not mark the object as unpersisted', function() {
        instance.destroy().then(() => {
          expect(instance.isPersisted).to.eq(true);
        });
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

      it('rejects the promise', function() {
        instance.destroy().catch((err) => {
          expect(err).to.eq('Server Error');
        });
      });
    });
  });
});
