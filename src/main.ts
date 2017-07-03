/// <reference path="./index.d.ts" />

import 'es6-promise';
import 'isomorphic-fetch';

import patchExtends from './custom-extend';
patchExtends();

import Config from './configuration';
import Model from './model';
import Attribute from './attribute';
import attrDecorator from './util/attr-decorator';
import { hasMany, hasOne, belongsTo } from './associations';

const attr = function() : any {
  return new Attribute();
}

export { Config, Model, attr, attrDecorator, hasMany, hasOne, belongsTo, patchExtends };
