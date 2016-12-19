/// <reference path="../index.d.ts" />

import Scope from './scope';
import Config from './configuration';

export default class Model implements IModel {
  static baseUrl = process.env.BROWSER? '': 'http://localhost:9999'
  static endpoint = 'define-in-subclass';
  static apiNamespace = '/';
  static jsonapiType = 'define-in-subclass';

  id: string;
  // attributes
  [key: string]: any;

  private static _scope: Scope;

  static inherited(subclass : typeof Model) {
    Config.models[subclass.jsonapiType] = subclass;
  }

  static scope(): Scope {
    return this._scope || new Scope(this);
  }

  constructor(attributes?: anyObject) {
    for(var key in attributes) {
      this[key] = attributes[key];
    }
  }

  static all() : Promise<Array<Model>> {
    return this.scope().all();
  }

  static find(id : string | number) : Promise<Model> {
    return this.scope().find(id);
  }

  static first() : Promise<Model> {
    return this.scope().first();
  }

  static where(clause: Object) : Scope {
    return this.scope().where(clause);
  }

  static page(number: number) : Scope {
    return this.scope().page(number);
  }

  static per(size: number) : Scope {
    return this.scope().per(size);
  }

  static order(clause: Object | string) : Scope {
    return this.scope().order(clause);
  }

  static select(clause: Object) : Scope {
    return this.scope().select(clause);
  }

  static includes(clause: string | Object | Array<any>) : Scope {
    return this.scope().includes(clause);
  }

  static url(id?: string | number) : string {
    let base = `${this.baseUrl}${this.apiNamespace}${this.endpoint}`;

    if (id) {
      base = `${base}/${id}`;
    }

    return base;
  }
}
