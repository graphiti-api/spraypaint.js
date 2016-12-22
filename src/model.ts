/// <reference path="../index.d.ts" />

import Scope from './scope';
import Config from './configuration';
import Attribute from './attribute';
import deserialize from './util/deserialize';
import _extend from './util/extend';

export default class Model implements IModel {
  static baseUrl = process.env.BROWSER? '': 'http://localhost:9999'
  static endpoint = 'define-in-subclass';
  static apiNamespace = '/';
  static jsonapiType = 'define-in-subclass';

  id: string;
  attributes: Object = {};
  __meta__: Object | void = null;
  parentClass: typeof Model;
  klass: typeof Model;

  static attributeList = [];
  private static _scope: Scope;

  static extend(obj : any) : any {
    return _extend(this, obj);
  }

  static inherited(subclass : any) {
    Config.models.push(subclass)
    subclass.parentClass = this;
    subclass.prototype.klass = subclass;
  }

  static scope(): Scope {
    return this._scope || new Scope(this);
  }

  constructor(attributes?: anyObject) {
    this._assignAttributes(attributes);
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

  static fromJsonapi(resource: japiResource) : any {
    return deserialize(resource);
  }

  private _assignAttributes(attrs: Object) : void {
    for(var key in attrs) {
      if (key == 'id' || this.klass.attributeList.indexOf(key) >= 0) {
        this[key] = attrs[key];
      }
    }
  }
}
