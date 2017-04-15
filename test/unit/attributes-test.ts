import { sinon, expect } from '../test-helper';
import { Person } from '../fixtures';

describe('Model attributes', function() {
  it('supports direct assignment', function() {
    let person = new Person();
    expect(person.firstName).to.eq(undefined);
    person.firstName = 'John';
    expect(person.firstName).to.eq('John');
  });

  it('supports constructor assignment', function() {
    let person = new Person({ firstName: 'Joe' });
    expect(person.firstName).to.eq('Joe');
    expect(person.attributes['firstName']).to.eq('Joe');
  });

  it('camelizes underscored strings', function() {
    let person = new Person({ first_name: 'Joe' });
    expect(person.firstName).to.eq('Joe');
  });

  it('syncs with #attributes', function() {
    let person = new Person();
    expect(person.attributes).to.eql({});
    person.firstName = 'John';
    expect(person.attributes).to.eql({ firstName: 'John' });
    person.attributes['firstName'] = 'Jane';
    expect(person.firstName).to.eq('Jane');
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
