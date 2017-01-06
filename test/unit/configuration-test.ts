/// <reference path="../../index.d.ts" />

import { sinon } from '../../test/test-helper';
import { Config } from '../../src/main';
import { Author } from '../fixtures';

describe('#modelForType', function() {
  it('returns the relevant class for jsonapiType', function() {
    expect(Config.modelForType('authors')).to.eq(Author);
  });

  describe('when no corresponding class found', function() {
    it('throws an error', function() {
      let fn = function() { Config.modelForType('asdf') };
      expect(fn).to.throw(/Could not find class for jsonapi type "asdf"/);
    });
  });
});
