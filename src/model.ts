/// <reference path="../index.d.ts" />

import Scope from './scope';
import Config from './configuration';
import Attribute from './attribute';
import deserialize from './util/deserialize';
import { CollectionProxy, RecordProxy } from './proxies';
import _extend from './util/extend';
import { camelize } from './util/string';

export default class Model {
  static baseUrl = process.env.BROWSER? '': 'http://localhost:9999'
  static apiNamespace = '/';
  static jsonapiType = 'define-in-subclass';
  static endpoint: string;

  id: string;
  _attributes: Object = {};
  relationships: Object = {};
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

  constructor(attributes?: Object) {
    this.attributes = attributes;
  }

  static all() : Promise<CollectionProxy<Model>> {
    return this.scope().all();
  }

  static find(id : string | number) : Promise<RecordProxy<Model>> {
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

  static selectExtra(clause: Object) : Scope {
    return this.scope().selectExtra(clause);
  }

  static includes(clause: string | Object | Array<any>) : Scope {
    return this.scope().includes(clause);
  }

  static url(id?: string | number) : string {
    let endpoint = this.endpoint || `/${this.jsonapiType}`;
    let base = `${this.baseUrl}${this.apiNamespace}${endpoint}`;

    if (id) {
      base = `${base}/${id}`;
    }

    return base;
  }

  static fromJsonapi(resource: japiResource, payload: japiDoc) : any {
    return deserialize(resource, payload);
  }

  get attributes() : Object {
    return this._attributes;
  }

  set attributes(attrs : Object) {
    for(var key in attrs) {
      let attributeName = camelize(key);
      if (key == 'id' || this.klass.attributeList.indexOf(attributeName) >= 0) {
        this[attributeName] = attrs[key];
      }
    }
  }
}
