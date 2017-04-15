/// <reference path="./index.d.ts" />

import patchExtends from './custom-extend';
patchExtends();

import Config from './configuration';
import Model from './model';
import Attribute from './attribute';
import { hasMany, hasOne, belongsTo } from './associations';

const attr = function() : any {
  return new Attribute();
}

export { Config, Model, attr, hasMany, hasOne, belongsTo, patchExtends };
