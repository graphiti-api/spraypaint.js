/// <reference path="../../index.d.ts" />

import { sinon } from '../../test/test-helper';
import { Model } from '../../src/main';
import { Person, Author } from '../fixtures';

let instance;

describe('Model', function() {
  describe('#fromJsonapi', function() {
    let payload = {
      id: '1',
      type: 'authors',
      attributes: {
        name: 'Jane'
      },
      meta: {
        big: true
      }
    };

    it('assigns id correctly', function() {
      let instance = Model.fromJsonapi(payload);
      expect(instance.id).to.eq('1');
    });

    it('instantiates the correct model for jsonapi type', function() {
      let instance = Model.fromJsonapi(payload);
      expect(instance).to.be.instanceof(Author);
    });

    it('assigns attributes correctly', function() {
      let instance = Model.fromJsonapi(payload);
      expect(instance.name).to.eq('Jane');
      expect(instance.attributes).to.eql({
        name: 'Jane'
      })
    });

    it('assigns metadata correctly', function() {
      let instance = Model.fromJsonapi(payload);
      expect(instance.__meta__).to.eql({
        big: true
      })
    });

    it('assigns relationships correctly');
  });
});
