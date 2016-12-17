/// <reference path="../index.d.ts" />

import * as es6Promise from 'es6-promise';
import 'isomorphic-fetch';
import * as sinon from 'sinon';
es6Promise.polyfill();

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as chaiThings from 'chai-things';

// MUST be in this order
chai.use(chaiThings);
chai.use(chaiAsPromised);

global['expect'] = chai.expect;
global['sinon'] = sinon;

global['asyncAssert'] = function(done, callback) {
  try {
    if (callback() === false) {
      done('Failed!');
    } else {
      done();
    }
  } catch(e) {
    done(e);
  }
}
