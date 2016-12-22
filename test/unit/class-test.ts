/// <reference path="../../index.d.ts" />

import { sinon } from '../../test/test-helper';
import { Person, Author } from '../fixtures';

const PlainJsClass = Person.extend({
  static: {
    jsonapiType: 'plain_js',
    classFunc() {
      return 'from class';
    }
  },

  foo: 'bar',
  bar() {
    return 'baz';
  }
})

describe('Plain JS class', function() {
  it('supports instance props', function() {
    let instance = new PlainJsClass();
    expect(instance.foo).to.eq('bar');
  });

  it('supports instance methods', function() {
    let instance = new PlainJsClass();
    expect(instance.bar()).to.eq('baz');
  });

  it('supports class props', function() {
    expect(PlainJsClass.jsonapiType).to.eq('plain_js');
  });

  it('supports class methods', function() {
    expect(PlainJsClass.classFunc()).to.eq('from class');
  });
});


