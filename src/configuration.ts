/// <reference path="../types/index.d.ts" />

import Model from './model';
import Attribute from './attribute';
import Logger from './logger';
import * as _cloneDeep from './util/clonedeep';
let cloneDeep: any = (<any>_cloneDeep).default || _cloneDeep;
if (cloneDeep.default) {
  cloneDeep = cloneDeep.default;
}

let ctx = this;

export default class Config {
  static models: Array<typeof Model> = [];
  static typeMapping: Object = {};
  static logger: Logger = new Logger();
  static jwtLocalStorage: string | false = 'jwt';
  static localStorage;

  static setup(options? : Object) : void {
    if (!options) options = {};

    this.jwtLocalStorage = options['jwtLocalStorage'];

    for (let model of this.models) {
      this.typeMapping[model.jsonapiType] = model;

      if (options['jwtOwners'] && options['jwtOwners'].indexOf(model) !== -1) {
        model.isJWTOwner = true;

        if (this.jwtLocalStorage) {
          model.jwt = this.localStorage.getItem(this.jwtLocalStorage);
        }
      }
    }

    for (let model of this.models) {
      Attribute.applyAll(model);
    }

    for (let model of this.models) {
      let parentAttrList = cloneDeep(model.parentClass.attributeList);
      let attrList = cloneDeep(model.attributeList);
      model.attributeList = Object.assign(parentAttrList, attrList);
    }
  }

  static reset() : void {
    this.typeMapping = {};
    this.models = [];
  }

  static modelForType(type: string) : typeof Model {
    let klass = this.typeMapping[type];
    if (klass) {
      return klass;
    } else {
      throw(`Could not find class for jsonapi type "${type}"`)
    }
  }
}

// In node, no localStorage available
// We do this so we can mock it
try {
  Config.localStorage = localStorage
} catch(e) {
}
