/// <reference path="../index.d.ts" />

import * as es6Promise from 'es6-promise';
import 'isomorphic-fetch';
es6Promise.polyfill();

import Model from "./model";

export { Model };
