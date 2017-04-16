/// <reference path="./index.d.ts" />

import Scope from './scope';
import Config from './configuration';
import Attribute from './attribute';
import { deserialize, deserializeInstance } from './util/deserialize';
import { CollectionProxy, RecordProxy } from './proxies';
import _extend from './util/extend';
import { camelize } from './util/string';
import WritePayload from './util/write-payload';
import Request from './request';

export default class Model {
  static baseUrl = 'http://please-set-a-base-url.com';
  static apiNamespace = '/';
  static jsonapiType = 'define-in-subclass';
  static endpoint: string;
  static isJWTOwner: boolean = false;
  static jwt: string = null;
  static parentClass: typeof Model;

  id: string;
  _attributes: Object = {};
  relationships: Object = {};
  __meta__: Object | void = null;
  _persisted: boolean = false;
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

  static setJWT(token: string) : void {
    this.getJWTOwner().jwt = token;
  }

  static getJWT() : string {
    let owner = this.getJWTOwner();

    if (owner) {
      return owner.jwt;
    }
  }

  static getJWTOwner() : typeof Model {
    if (this.isJWTOwner) {
      return this;
    } else {
      if (this.parentClass) {
        return this.parentClass.getJWTOwner();
      } else {
        return;
      }
    }
  }

  static all() : Promise<CollectionProxy<Model>> {
    return this.scope().all();
  }

  static find(id : string | number) : Promise<RecordProxy<Model>> {
    return this.scope().find(id);
  }

  static first() : Promise<RecordProxy<Model>> {
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

  static stats(clause: Object) : Scope {
    return this.scope().stats(clause);
  }

  static includes(clause: string | Object | Array<any>) : Scope {
    return this.scope().includes(clause);
  }

  static merge(obj : Object) : Scope {
    return this.scope().merge(obj);
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

  constructor(attributes?: Object) {
    this.attributes = attributes;
  }

  isType(jsonapiType : string) {
    return this.klass.jsonapiType === jsonapiType;
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

  isPersisted(val? : boolean) : boolean {
    if (val != undefined) {
      this._persisted = val;
      return val;
    } else {
      return this._persisted;
    }
  }

  fromJsonapi(resource: japiResource, payload: japiDoc) : any {
    return deserializeInstance(this, resource, payload);
  }

  destroy() : Promise<any> {
    let url     = this.klass.url(this.id);
    let verb    = 'delete';
    let request = new Request();
    let jwt     = this.klass.getJWT();

    let requestPromise = request.delete(url, { jwt });
    return this._writeRequest(requestPromise, () => {
      this.isPersisted(false);
    });
  }

  save() : Promise<any> {
    let url     = this.klass.url();
    let verb    = 'post';
    let request = new Request();
    let payload = new WritePayload(this);
    let jwt     = this.klass.getJWT();

    if (this.isPersisted()) {
      url  = this.klass.url(this.id);
      verb = 'put';
    }

    let requestPromise = request[verb](url, payload.asJSON(), { jwt });
    return this._writeRequest(requestPromise, () => {
      this.isPersisted(true);
    });
  }

  private

  _writeRequest(requestPromise : Promise<any>, callback: Function) : Promise<any> {
    return new Promise((resolve, reject) => {
      return requestPromise.then((response) => {
        this._handleResponse(response, resolve, reject, callback);
      });
    });
  }

  _handleResponse(response: any, resolve: Function, reject: Function, callback: Function) : void {
    if (response.status == 422) {
      resolve(false);
    } else if (response.status >= 500) {
      reject('Server Error');
    } else {
      this.fromJsonapi(response['jsonPayload'].data, response['jsonPayload']);
      callback(response);
      resolve(true);
    }
  }
}
