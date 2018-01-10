import { sinon, expect } from '../test-helper'
import { Person, Author, PersonWithoutCamelizedKeys } from '../fixtures'

describe('Model attributes', () => {
  it('supports direct assignment', () => {
    let person = new Person()
    expect(person.firstName).to.eq(undefined)
    person.firstName = 'John'
    expect(person.firstName).to.eq('John')
  })

  it('supports constructor assignment', () => {
    let person = new Person({ firstName: 'Joe' })
    expect(person.firstName).to.eq('Joe')
    expect(person.attributes.firstName).to.eq('Joe')
  })

  it('camelizes underscored strings', () => {
    let person = new Person({ first_name: 'Joe' })
    expect(person.firstName).to.eq('Joe')
  })

  it('does not camlize underscored strings if camelization is disabled', () => {
    let person = new PersonWithoutCamelizedKeys({ first_name: 'Joe' })
    expect(person.firstName).to.eq(undefined)
    expect(person.first_name).to.eq('Joe')
  })

  it('syncs with #attributes', () => {
    let person = new Person()
    expect(person.attributes).to.eql({})
    person.firstName = 'John'
    expect(person.attributes).to.eql({ firstName: 'John' })
    person.attributes.firstName = 'Jane'
    expect(person.firstName).to.eq('Jane')
  })

  it('sets attributes properties on the instance', () => {
    let person = new Person()
    expect(person.hasOwnProperty('firstName')).to.eq(true)
    expect(Object.getOwnPropertyDescriptor(person, 'firstName'))
      .to.not.eq(undefined)
  })

  it('defaults hasMany before the getter is called', () => {
    let author = new Author()
    expect(author.books).to.deep.eq([])
  })

  it('has enumerable properties', () => {
    let person = new Person()
    let keys = Object.keys(person)

    expect(keys).to.include('firstName')
    expect(keys).to.include('lastName')
  })

  it('has enumerable properties even when subclassing', () => {
    class BadPerson extends Person {}

    let badPerson = new BadPerson()
    let keys = Object.keys(badPerson)

    expect(keys).to.include('firstName')
    expect(keys).to.include('lastName')
  })

  it('includes persistence indicators in enumerable properties', () => {
    class BadPerson extends Person {}

    let badPerson = new BadPerson()
    let keys = Object.keys(badPerson)

    expect(keys).to.include('isPersisted')
    expect(keys).to.include('isMarkedForDestruction')
    expect(keys).to.include('isMarkedForDisassociation')
  })
  

  it('does not include private variables and meta attributes in enumeration', () => {
    class BadPerson extends Person {}

    let badPerson = new BadPerson()
    let keys = Object.keys(badPerson)

    for(let i in keys) {
      expect(keys[i]).not.to.match(/^_/)
      expect([
        'relationships',
        'klass',
        'attributes',
      ]).not.to.include(keys[i])
    }
  })

  // Without this behavior, the API could add a backwards-compatible field,
  // and this object might blow up.
  context('when passed an invalid attribute in constructor', () => {
    context('Default model settings', () =>{
      let Model = Person
      it('silently drops', () => {
        let person = new Model({ foo: 'bar' })
        expect(person.attributes.foo).to.eq(undefined)
      })

      describe('but that attribute exists in an unrelated model', () => {
        it('still silently drops', () => {
          let person = new Model({ title: 'bar' })
          expect(person.attributes.title).to.eq(undefined)
        })
      })

      describe('but that attribute exists in a subclass', () => {
        it('still silently drops', () => {
          let person = new Model({ extraThing: 'bar' })
          expect(person.attributes.extraThing).to.eq(undefined)
        })
      })
    })

    context('when the model has strictAttributes set', () =>{
      let Model = Person.extend({
        static: {
          strictAttributes: true
        }
      })

      it('raises an error', () => {
        expect(() => {
          new Model({ foo: 'bar' })
        }).to.throw(/Unknown attribute: foo/)
      })

      describe('but that attribute exists in an unrelated model', () => {
        it('raises an error', () => {
          expect(() => {
            new Model({ title: 'bar' })
          }).to.throw(/Unknown attribute: title/)
        })
      })

      describe('but that attribute exists in a subclass', () => {
        it('raises an error', () => {
          expect(() => {
            new Model({ extraThing: 'bar' })
          }).to.throw(/Unknown attribute: extraThing/)
        })
      })
    })
  })
})
