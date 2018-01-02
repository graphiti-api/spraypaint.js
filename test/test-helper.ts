import * as winston from 'winston';
import * as es6Promise from 'es6-promise';
import 'isomorphic-fetch';
import * as sinon from 'sinon';
import * as fetchMock from 'fetch-mock';
import 'mocha';
es6Promise.polyfill();

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
const chaiThings = require('chai-things');

import { Config } from '../src/index';

winston.level = 'warn';
Config.logger = winston;

// MUST be in this order
chai.use(chaiThings);
chai.use(chaiAsPromised);

let expect = chai.expect;

export { sinon, expect, fetchMock };
