/// <reference path="../index.d.ts" />

import Model from './model';
import Attribute from './attribute';
import Logger from './logger';

export default class Config {
  static models: Array<typeof Model> = [];
  static typeMapping: Object = {};
  static logger: Logger = new Logger();

  static bootstrap() : void {
    for (let model of this.models) {
      this.typeMapping[model.jsonapiType] = model;
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
    return this.typeMapping[type];
  }
}
