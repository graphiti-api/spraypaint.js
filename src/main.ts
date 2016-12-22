/// <reference path="../index.d.ts" />

// https://github.com/Microsoft/TypeScript/issues/6425
global.__extends = (this && this.__extends) || function (d, b) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  if (b.inherited) b.inherited(d);
};

import Config from './configuration';
import Model from './model';
import Attribute from './attribute';
import { hasMany, hasOne, belongsTo } from './associations';

const attr = function() : any {
  return new Attribute();
}

export { Config, Model, attr, hasMany, hasOne, belongsTo };
