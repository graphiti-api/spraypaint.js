import '../test/test-helper';
import { Model } from '../src/main';

class Person extends Model {
  static baseUrl = 'http://example.com';
  static apiNamespace = '/api';
  static endpoint = '/v1/people';
}

let fetchMock = require('fetch-mock');
let mockResponse = {};

before(function() {
  fetchMock.get('http://example.com/api/v1/people/1', {
    data: {
      id: '1'
    }
  });
});

after(function () {
  fetchMock.restore();
});

describe('Model', function() {
  describe('#find()', function() {
    before(function () {
      fetchMock.get('http://example.com/api/v1/people/1', {
        data: {
          id: '1'
        }
      });
    });

    it('returns a promise that resolves the correct instance', function() {
      return expect(Person.find(1)).to.eventually
        .be.instanceof(Person).and
        .have.property('id', '1');
    });

    describe('when API response returns a different type than the caller', function() {
      it('resolves to the correct class', function() {
      });
    });
  });

  describe('#all()', function() {
    before(function () {
      fetchMock.get('http://example.com/api/v1/people', {
        data: [
          { id: '1' }
        ]
      });
    });

    it('returns a promise that resolves the correct instances', function() {
      return expect(Person.all()).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '1').and
    });
  });
});
