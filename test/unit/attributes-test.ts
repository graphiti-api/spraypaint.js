import { sinon, expect } from '../test-helper';
import { Person, Author } from '../fixtures';

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

  it('sets attributes properties on the instance', function() {
    let person = new Person();
    expect(person.hasOwnProperty('firstName')).to.eq(true);
    expect(Object.getOwnPropertyDescriptor(person, 'firstName'))
      .to.not.eq(undefined);
  });

  it('defaults hasMany before the getter is called', function() {
    let author = new Author();
    expect(author.relationships['books']).to.deep.eq([])
  });

  // Without this behavior, the API could add a backwards-compatible field,
  // and this object might blow up.
  describe('when passed an invalid attribute in constructor', function() {
    it('silently drops', function() {
      let person = new Person({ foo: 'bar' });
      expect(person['foo']).to.eq(undefined);
    });

    describe('but that attribute exists in an unrelated model', function() {
      it('still silently drops', function() {
        let person = new Person({ title: 'bar' });
        expect(person['title']).to.eq(undefined);
      });
    });

    describe('but that attribute exists in a subclass', function() {
      it('still silently drops', function() {
        let person = new Person({ extraThing: 'bar' });
        expect(person['extraThing']).to.eq(undefined);
      });
    });
  })
});
