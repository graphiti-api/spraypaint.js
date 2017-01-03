/// <reference path="../../index.d.ts" />

import { sinon } from '../../test/test-helper';
import Scope from '../../src/scope';

let scope;

beforeEach(function() {
  let model = sinon.stub();
  scope = new Scope(model);
});

describe('Scope', function() {
  describe('#page()', function() {
    it('sets correct pagination information', function() {
      scope.page(2);
      expect(scope._pagination).to.eql({ number: 2 });
    });

    it('returns the scope', function() {
      expect(scope.page(2)).to.be.instanceof(Scope)
    });
  });

  describe('#per()', function() {
    it('sets correct pagination information', function() {
      scope.per(10);
      expect(scope._pagination).to.eql({ size: 10 });
    });

    it('returns the scope', function() {
      expect(scope.per(10)).to.be.instanceof(Scope)
    });
  });

  describe('#where()', function() {
    it('updates filter criteria', function() {
      scope.where({ foo: 'bar' })
      scope.where({ bar: 'baz' })
      scope.where({ foo: 'bar2' })
      expect(scope._filter).to.eql({
        foo: 'bar2',
        bar: 'baz'
      });
    });

    it('returns the scope', function() {
      expect(scope.where({ foo: 'bar' })).to.be.instanceof(Scope)
    });
  });

  describe('#order()', function() {
    it('updates sort criteria', function() {
      scope.order('foo');
      scope.order({ bar: 'desc' });
      expect(scope._sort).to.eql({
        foo: 'asc',
        bar: 'desc'
      });
    });

    it('returns the scope', function() {
      expect(scope.order('foo')).to.be.instanceof(Scope)
    });
  });

  describe('#select()', function() {
    it('updates fields criteria', function() {
      scope.select({ people: ['foo', 'bar'] });
      scope.select({ things: ['baz'] })
      expect(scope._fields).to.eql({
        people: ['foo', 'bar'],
        things: ['baz']
      });
    });

    it('returns the scope', function() {
      expect(scope.select({ people: ['foo'] })).to.be.instanceof(Scope)
    });
  });

  describe('#includes()', function() {
    describe('when passed a string', function() {
      it('updates include criteria', function() {
        scope.includes('foo')
        expect(scope._include).to.eql({
          foo: {}
        });
      });
    });

    describe('when passed an array', function() {
      it('updates include criteria', function() {
        scope.includes(['foo', 'bar']);
        expect(scope._include).to.eql({
          foo: {},
          bar: {}
        });
      });
    });

    describe('when passed a nested object', function() {
      it('updates include criteria', function() {
        scope.includes({ a: ['b', { c: 'd' }] });
        expect(scope._include).to.eql({
          a: {
            b: {},
            c: {
              d: {}
            }
          }
        });
      });
    });

    it('returns the scope', function() {
      expect(scope.includes('foo')).to.be.instanceof(Scope)
    });
  });

  describe('#asQueryParams()', function() {
    it('transforms all scoping criteria into a jsonapi-compatible query param object', function() {
      scope
        .page(2)
        .per(10)
        .where({ foo: 'bar' })
        .where({ bar: 'baz' })
        .order('foo')
        .order({ bar: 'desc' })
        .select({ people: ['name', 'age'] })
        .select({ pets: ['type'] })
        .selectExtra({ people: ['net_worth'] })
        .includes({ a: ['b', { c: 'd' }] })
      let qp = scope.asQueryParams();

      expect(qp).to.eql({
        page: {
          size: 10,
          number: 2
        },
        filter: {
          bar: 'baz',
          foo: 'bar'
        },
        sort: ['foo', '-bar'],
        fields: {
          people: ['name', 'age'],
          pets: ['type']
        },
        extra_fields: {
          people: ['net_worth']
        },
        include: 'a.b,a.c.d'
      });
    });
  });

  describe('#toQueryParams', function() {
    it('transforms nested query parameter object to query string', function() {
      scope
        .page(2)
        .per(10)
        .where({ foo: 'bar' })
        .order('foo')
        .order({ bar: 'desc' })
        .select({ people: ['name', 'age'] })
        .includes({ a: ['b', { c: 'd' }] })
      expect(scope.toQueryParams()).to.eq('page[number]=2&page[size]=10&filter[foo]=bar&sort=foo,-bar&fields[people]=name,age&include=a.b,a.c.d');
    });

    it('does not include empty objects', function() {
      scope.page(2);
      expect(scope.toQueryParams().match(/field/) === null).to.eq(true);
    });

    describe('when no scoping criteria present', function() {
      it('returns undefined', function() {
        expect(scope.toQueryParams()).to.eq(undefined);
      })
    });
  });
});
