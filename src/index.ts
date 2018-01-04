import 'object-assign-shim';
import * as es6Promise from 'es6-promise';
es6Promise.polyfill();

export { JSORMBase as JSORMBase, ModelConstructor } from './model';
export { Attribute, attr } from './attribute';

export { hasMany, hasOne, belongsTo } from './associations';

export { 
  Model, 
  Attr,
  HasMany,
  HasOne,
} from './decorators'
