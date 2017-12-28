import { sinon, expect } from './test-helper';
import { Person, Author } from './fixtures';

describe('Breaking changes', () => {
  const PlainJsClass = Person.extend({
    static: {
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

    it('supports class methods', function() {
      expect(PlainJsClass.classFunc()).to.eq('from class');
    });
  });
})