/// <reference path="../types/index.d.ts" />

import Scope from './scope';
import Config from './configuration';
import Attribute from './attribute';
import { deserialize, deserializeInstance } from './util/deserialize';
import { CollectionProxy, RecordProxy } from './proxies';
import _extend from './util/extend';
import { camelize } from './util/string';
import WritePayload from './util/write-payload';
import IncludeDirective from './util/include-directive';
import DirtyChecker from './util/dirty-check';
import ValidationErrors from './util/validation-errors';
import refreshJWT from './util/refresh-jwt';
import relationshipIdentifiersFor from './util/relationship-identifiers';
import Request from './request';
import cloneDeep from './util/clonedeep';

export default class Model {
  static baseUrl = 'http://please-set-a-base-url.com';
  static apiNamespace = '/';
  static jsonapiType = 'define-in-subclass';
  static endpoint: string;
  static isJWTOwner: boolean = false;
  static jwt?: string;
  static parentClass: typeof Model;
  static camelizeKeys: boolean = true;

  id: string;
  temp_id: string;
  _attributes: Object = {};
  _originalAttributes: Object = {};
  _originalRelationships: Object = {};
  relationships: Object = {};
  errors: Object = {};
  __meta__: Object | null = null;
  _persisted: boolean = false;
  _markedForDestruction: boolean = false;
  _markedForDisassociation: boolean = false;
  klass: typeof Model;

  static attributeList = {};
  private static _scope: Scope;

  static extend(obj : any) : any {
    return _extend(this, obj);
  }

  static inherited(subclass : any) {
    Config.models.push(subclass)
    subclass.parentClass = this;
    subclass.prototype.klass = subclass;
    subclass.attributeList = cloneDeep(subclass.attributeList)
  }

  static scope(): Scope {
    return this._scope || new Scope(this);
  }

  static setJWT(token: string) : void {
    this.getJWTOwner().jwt = token;
  }

  static getJWT() : string | undefined {
    let owner = this.getJWTOwner();

    if (owner) {
      return owner.jwt;
    }
  }

  static fetchOptions() : RequestInit {
    let options = {
      headers: {
        Accept: 'application/json',
        ['Content-Type']: 'application/json'
      } as any
    }

    if (this.getJWT()) {
      options.headers.Authorization = `Token token="${this.getJWT()}"`;
    }

    return options
  }

  static getJWTOwner() : typeof Model | undefined {
    if (this.isJWTOwner) {
      return this;
    } else if (this.parentClass) {
        return this.parentClass.getJWTOwner();
    } else {
      return;
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
    let base = `${this.fullBasePath()}${endpoint}`;

    if (id) {
      base = `${base}/${id}`;
    }

    return base;
  }

  static fullBasePath() : string {
    return `${this.baseUrl}${this.apiNamespace}`;
  }

  static fromJsonapi(resource: japiResource, payload: japiDoc) : any {
    return deserialize(resource, payload);
  }

  constructor(attributes?: Object) {
    this._initializeAttributes();
    this.attributes = attributes || {};
    this._originalAttributes = cloneDeep(this.attributes);
    this._originalRelationships = this.relationshipResourceIdentifiers(Object.keys(this.relationships));
  }

  clearErrors() {
    this.errors = {};
  }

  // Todo:
  // * needs to recurse the directive
  // * remove the corresponding code from isPersisted and handle here (likely
  // only an issue with test setup)
  // * Make all calls go through resetRelationTracking();
  resetRelationTracking(includeDirective: Object) {
    this._originalRelationships = this.relationshipResourceIdentifiers(Object.keys(includeDirective));
  }

  relationshipResourceIdentifiers(relationNames: Array<string>) {
    return relationshipIdentifiersFor(this, relationNames);
  }

  isType(jsonapiType : string) {
    return this.klass.jsonapiType === jsonapiType;
  }

  get resourceIdentifier() : Object {
    return { type: this.klass.jsonapiType, id: this.id };
  }

  get attributes() : Object {
    return this._attributes;
  }

  set attributes(attrs : Object) {
    this._attributes = {};
    this.assignAttributes(attrs);
  }

  assignAttributes(attrs: Object) {
    for(var key in attrs) {
      let attributeName = key;

      if (this.klass.camelizeKeys) {
        attributeName = camelize(key);
      }
      
      if (key == 'id' || this.klass.attributeList[attributeName]) {
        this[attributeName] = attrs[key];
      }
    }
  }

  isPersisted(val? : boolean) : boolean {
    if (val != undefined) {
      this._persisted = val;
      this._originalAttributes = cloneDeep(this.attributes);
      this._originalRelationships = this.relationshipResourceIdentifiers(Object.keys(this.relationships));
      return val;
    } else {
      return this._persisted;
    }
  }

  isMarkedForDestruction(val? : boolean) : boolean {
    if (val != undefined) {
      this._markedForDestruction = val;
      return val;
    } else {
      return this._markedForDestruction;
    }
  }

  isMarkedForDisassociation(val? : boolean) : boolean {
    if (val != undefined) {
      this._markedForDisassociation = val;
      return val;
    } else {
      return this._markedForDisassociation;
    }
  }

  fromJsonapi(resource: japiResource, payload: japiDoc, includeDirective: Object = {}) : any {
    return deserializeInstance(this, resource, payload, includeDirective);
  }

  get hasError() {
    return Object.keys(this.errors).length > 1;
  }

  isDirty(relationships?: Object | Array<any> | string) : boolean {
    let dc = new DirtyChecker(this);
    return dc.check(relationships);
  }

  changes() : Object {
    let dc = new DirtyChecker(this);
    return dc.dirtyAttributes();
  }

  hasDirtyRelation(relationName: string, relatedModel: Model) : boolean {
    let dc = new DirtyChecker(this);
    return dc.checkRelation(relationName, relatedModel);
  }

  dup() : Model {
    return cloneDeep(this);
  }

  destroy() : Promise<any> {
    let url     = this.klass.url(this.id);
    let verb    = 'delete';
    let request = new Request();

    let requestPromise = request.delete(url, this._fetchOptions());
    return this._writeRequest(requestPromise, () => {
      this.isPersisted(false);
    });
  }

  save(options: Object = {}) : Promise<any> {
    let url     = this.klass.url();
    let verb    = 'post';
    let request = new Request();
    let payload = new WritePayload(this, options['with']);

    if (this.isPersisted()) {
      url  = this.klass.url(this.id);
      verb = 'put';
    }

    let json = payload.asJSON();
    let requestPromise = request[verb](url, json, this._fetchOptions());
    return this._writeRequest(requestPromise, (response) => {
      this.fromJsonapi(response['jsonPayload'].data, response['jsonPayload'], payload.includeDirective);
      //this.isPersisted(true);
      payload.postProcess();
    });
  }

  // Define getter/setters and set defaults
  private _initializeAttributes() {
    for (let key in this.klass.attributeList) {
      let attr = this.klass.attributeList[key];
      Object.defineProperty(this, attr.name, attr.descriptor());
      this[key] = this[key]; // set defaults
    }
  }

  private _writeRequest(requestPromise : Promise<any>, callback: Function) : Promise<any> {
    return new Promise((resolve, reject) => {
      requestPromise.catch((e) => { throw(e) });
      return requestPromise.then((response) => {
        this._handleResponse(response, resolve, reject, callback);
      });
    });
  }

  private _handleResponse(response: any, resolve: Function, reject: Function, callback: Function) : void {
    refreshJWT(this.klass, response);

    if (response.status == 422) {
      ValidationErrors.apply(this, response['jsonPayload']);
      resolve(false);
    } else if (response.status >= 500) {
      reject('Server Error');
    } else {
      callback(response);
      resolve(true);
    }
  }

  private _fetchOptions() : RequestInit {
    return this.klass.fetchOptions()
  }
}
