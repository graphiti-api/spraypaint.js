/// <reference path="../types/index.d.ts" />

import 'object-assign-shim'
import * as es6Promise from 'es6-promise';
es6Promise.polyfill();

import patchExtends from './custom-extend';
patchExtends();

import Config from './configuration';
import Model from './model';
import Attribute from './attribute';
import attrDecorator from './util/attr-decorator';
import { hasMany, hasOne, belongsTo } from './associations';

const attr = function(opts?: attributeOptions) : any {
  return new Attribute(opts);
}

export { Config, Model, attr, attrDecorator, hasMany, hasOne, belongsTo, patchExtends };
