import '../../test/test-helper';
import { Person, Author } from '../fixtures';

let fetchMock = require('fetch-mock');

after(function () {
  fetchMock.restore();
});

describe('Model finders', function() {
  describe('#find()', function() {
    before(function () {
      fetchMock.get('http://example.com/api/v1/people/1', {
        data: {
          id: '1',
          type: 'people',
          attributes: {
            name: 'John'
          }
        }
      });
    });

    it('returns a promise that resolves the correct instance', function() {
      return expect(Person.find(1)).to.eventually
        .be.instanceof(Person).and
        .have.property('id', '1');
    });

    it('assigns attributes correctly', function() {
      return expect(Person.find(1)).to.eventually
        .have.property('name', 'John')
    });

    describe('when API response returns a different type than the caller', function() {
      before(function() {
        fetchMock.restore();
        fetchMock.get('http://example.com/api/v1/people/1', {
          data: {
            id: '1',
            type: 'authors'
          }
        });
      });

      it('resolves to the correct class', function() {
        return expect(Person.find(1)).to.eventually
          .be.instanceof(Author);
      });
    });
  });

  describe('#first()', function() {
    before(function () {
      // NOTE: This limits to only one record
      fetchMock.get('http://example.com/api/v1/people?page[size]=1', {
        data: [
          {
            id: '1',
            type: 'people'
          }
        ]
      });
    });

    it('returns a promise that resolves the correct instances', function() {
      return expect(Person.first()).to.eventually
        .be.instanceof(Person)
        .have.property('id', '1')
    });
  });

  describe('#all()', function() {
    before(function () {
      fetchMock.get('http://example.com/api/v1/people', {
        data: [
          { id: '1', type: 'people' }
        ]
      });
    });

    it('returns a promise that resolves the correct instances', function() {
      return expect(Person.all()).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '1')
    });
  });

  describe('#page', function() {
    before(function () {
      fetchMock.get('http://example.com/api/v1/people?page[number]=2', {
        data: [
          { id: '2', type: 'people' }
        ]
      });
    });

    it('queries correctly', function() {
      return expect(Person.page(2).all()).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '2')
    });
  });

  describe('#per', function() {
    before(function () {
      fetchMock.get('http://example.com/api/v1/people?page[size]=10', {
        data: [
          { id: '2', type: 'people' }
        ]
      });
    });

    it('queries correctly', function() {
      return expect(Person.page(2).all()).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '2')
    });
  });

  describe('#order', function() {
    before(function () {
      fetchMock.get('http://example.com/api/v1/people?sort=foo,-bar', {
        data: [
          { id: '2', type: 'people' }
        ]
      });
    });

    it('queries correctly', function() {
      return expect(Person.order('foo').order({ bar: 'desc' }).all()).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '2')
    });
  });

  describe('#where', function() {
    before(function () {
      fetchMock.get('http://example.com/api/v1/people?filter[id]=2&filter[a]=b', {
        data: [
          { id: '2', type: 'people' }
        ]
      });
    });

    it('queries correctly', function() {
      return expect(Person.where({ id: 2 }).where({ a: 'b' }).all()).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '2')
    });
  });

  describe('#select', function() {
    before(function () {
      fetchMock.get('http://example.com/api/v1/people?fields[people]=name,age', {
        data: [
          { id: '2', type: 'people' }
        ]
      });
    });

    it('queries correctly', function() {
      return expect(Person.select({ people: ['name', 'age'] }).all()).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '2')
    });
  });

  describe('#select_extra', function() {
    before(function () {
      fetchMock.get('http://example.com/api/v1/people?extra_fields[people]=net_worth,best_friend', {
        data: [
          { id: '2', type: 'people' }
        ]
      });
    });

    it('queries correctly', function() {
      return expect(Person.selectExtra({ people: ['net_worth', 'best_friend'] }).all()).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '2')
    });
  });

  describe('#includes', function() {
    before(function () {
      fetchMock.get('http://example.com/api/v1/people?include=a.b,a.c.d', {
        data: [
          {
            id: '2',
            type: 'people'
          }
        ],
      });
    });

    it('queries correctly', function() {
      return expect(Person.includes({ a: ['b', { c: 'd' }] }).all()).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '2')
    });
  });
});
