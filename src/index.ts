import 'object-assign-shim';
import * as es6Promise from 'es6-promise';
es6Promise.polyfill();

export { default as Config } from './configuration';
export { JSORMBase as JSORMBase, ModelConstructor } from './model';
export { Attribute, attr } from './attribute';

export { hasMany, hasOne, belongsTo } from './associations';

export { 
  Model, 
  Attr 
} from './decorators'

// const attr = function(opts?: attributeOptions): any {
//   return new Attribute(opts);
// };
