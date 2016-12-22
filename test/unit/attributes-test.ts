/// <reference path="../../index.d.ts" />

import { sinon } from '../../test/test-helper';
import { Person } from '../fixtures';

describe('Model attributes', function() {
  it('supports direct assignment', function() {
    let person = new Person();
    expect(person.name).to.eq(undefined);
    person.name = 'John';
    expect(person.name).to.eq('John');
  });

  it('supports constructor assignment', function() {
    let person = new Person({ name: 'Joe' });
    expect(person.name).to.eq('Joe');
    expect(person.attributes['name']).to.eq('Joe');
  });

  it('syncs with #attributes', function() {
    let person = new Person();
    expect(person.attributes).to.eql({});
    person.name = 'John';
    expect(person.attributes).to.eql({ name: 'John' });
    person.attributes['name'] = 'Jane';
    expect(person.name).to.eq('Jane');
  });

  // Without this behavior, the API could add a backwards-compatible field,
  // and this object might blow up.
  describe('when passed an invalid attribute in constructor', function() {
    it('silently drops', function() {
      let person = new Person({ foo: 'bar' });
      expect(person['foo']).to.eq(undefined);
    });
  })
});
