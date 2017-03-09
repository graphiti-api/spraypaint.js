import '../../test/test-helper';
import { Person, Author, Book } from '../fixtures';

let fetchMock = require('fetch-mock');

after(function () {
  fetchMock.restore();
});

let resultData = function(promise) {
  return promise.then(function(proxyObject) {
    return proxyObject.data
  })
}

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
      return expect(resultData(Person.find(1))).to.eventually
        .be.instanceof(Person).and
        .have.property('id', '1');
    });

    it('assigns attributes correctly', function() {
      return expect(resultData(Person.find(1))).to.eventually
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
        return expect(resultData(Person.find(1))).to.eventually
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
      return expect(resultData(Person.first())).to.eventually
        .be.instanceof(Person)
        .have.property('id', '1')
    });
  });

  describe('#all()', function() {
    beforeEach(function () {
      fetchMock.restore();
      fetchMock.get('http://example.com/api/v1/people', {
        data: [
          { id: '1', type: 'people' }
        ]
      });
    });

    it('returns a promise that resolves the correct instances', function() {
      return expect(resultData(Person.all())).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '1')
    });

    describe('response includes a meta payload', function() {
      beforeEach(function () {
        fetchMock.restore();
        fetchMock.get('http://example.com/api/v1/people', {
          data: [
            { id: '1', type: 'people' }
          ],
          meta: {
            stats: {
              total: {
                count: 45
              },
            }
          }
        });
      });

      it('includes meta payload in the resulting collection', function() {
        return expect(Person.all()).to.eventually
          .have.deep.property('meta.stats.total.count', 45)
      });
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
      return expect(resultData(Person.page(2).all())).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '2')
    });

    describe('when merging association #page', function() {
      before(function () {
        fetchMock.reset();
        fetchMock.get('http://example.com/api/v1/people?page[number]=5&page[books][number]=10', {
          data: [
            { id: '1', type: 'people' }
          ]
        });
      });

      it('queries correctly', function() {
        let bookScope = Book.page(10);
        let personScope = Person.page(5).merge({ books: bookScope });
        return expect(resultData(personScope.all())).to.eventually
          .all.be.instanceof(Person)
      });
    });
  });

  describe('#per', function() {
    before(function () {
      fetchMock.get('http://example.com/api/v1/people?page[size]=5', {
        data: [
          { id: '1', type: 'people' }
        ]
      });
    });

    it('queries correctly', function() {
      return expect(resultData(Author.per(5).all())).to.eventually
        .all.be.instanceof(Person)
    });

    describe('when merging association #per', function() {
      before(function () {
        fetchMock.reset();
        fetchMock.get('http://example.com/api/v1/people?page[size]=5&page[books][size]=2', {
          data: [
            { id: '1', type: 'people' }
          ]
        });
      });

      it('queries correctly', function() {
        let bookScope = Book.per(2);
        let personScope = Person.per(5).merge({ books: bookScope });
        return expect(resultData(personScope.all())).to.eventually
          .all.be.instanceof(Person)
      });
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
      return expect(resultData(Person.order('foo').order({ bar: 'desc' }).all())).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '2')
    });

    describe('when merging association #order', function() {
      before(function () {
        fetchMock.reset();
        fetchMock.get('http://example.com/api/v1/people?sort=foo,books.title,-books.pages', {
          data: [
            { id: '2', type: 'people' }
          ]
        });
      });

      it('queries correctly', function() {
        let bookScope = Book.order('title').order({ pages: 'desc' });
        let scope = Person.order('foo');
        scope = scope.merge({ books: bookScope })
        return expect(resultData(scope.all())).to.eventually
          .all.be.instanceof(Person)
          .all.have.property('id', '2')
      });
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
      return expect(resultData(Person.where({ id: 2 }).where({ a: 'b' }).all())).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '2')
    });

    describe('when merging association #where', function() {
      before(function () {
        fetchMock.reset();
        fetchMock.get('http://example.com/api/v1/people?filter[id]=1&filter[books][title]=It', {
          data: [
            { id: '1', type: 'people' }
          ]
        });
      });

      it('queries correctly', function() {
        let bookScope = Book.where({ title: 'It' });
        let personScope = Person.where({id : 1 }).merge({ books: bookScope });
        return expect(resultData(personScope.all())).to.eventually
          .all.be.instanceof(Person)
      });
    });
  });

  describe('#stats', function() {
    before(function () {
      fetchMock.get('http://example.com/api/v1/people?stats[total]=count,sum', {
        data: [
          { id: '1', type: 'people' }
        ]
      });
    });

    it('queries correctly', function() {
      let scope = Person.stats({ total: ['count', 'sum'] });
      return expect(resultData(scope.all())).to.eventually
        .all.be.instanceof(Person)
    });

    describe('when merging association #stats', function() {
      before(function() {
        fetchMock.reset();
        fetchMock.get('http://example.com/api/v1/people?stats[total]=count,sum&stats[books][pages]=average', {
          data: [
            { id: '1', type: 'people' }
          ]
        });
      });

      it('queries correctly', function() {
        let bookScope = Book.stats({ pages: ['average'] });
        let scope     = Person.stats({ total: ['count', 'sum'] });
        scope         = scope.merge({ books: bookScope });

        return expect(resultData(scope.all())).to.eventually
          .all.be.instanceof(Person)
      });
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
      return expect(resultData(Person.select({ people: ['name', 'age'] }).all())).to.eventually
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
      return expect(resultData(Person.selectExtra({ people: ['net_worth', 'best_friend'] }).all())).to.eventually
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
      return expect(resultData(Person.includes({ a: ['b', { c: 'd' }] }).all())).to.eventually
        .all.be.instanceof(Person)
        .all.have.property('id', '2')
    });
  });
});
