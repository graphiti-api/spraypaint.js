/// <reference path="../types/index.d.ts" />

import Model from './model';
import Attribute from './attribute';
import Logger from './logger';

let ctx = this;

export default class Config {
  static models: Array<typeof Model> = [];
  static typeMapping: Object = {};
  static logger: Logger = new Logger();

  static setup(options? : Object) : void {
    if (!options) options = {};

    for (let model of this.models) {
      this.typeMapping[model.jsonapiType] = model;

      if (options['jwtOwners'] && options['jwtOwners'].indexOf(model) !== -1) {
        model.isJWTOwner = true;
      }
    }

    for (let model of this.models) {
      Attribute.applyAll(model);
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
