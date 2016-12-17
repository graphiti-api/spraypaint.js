/// <reference path="../index.d.ts" />

import Scope from './scope';

export default class Model {
  static baseUrl = process.env.BROWSER? '': 'http://localhost:9999'
  static endpoint = 'define-in-subclass';
  static apiNamespace = '/';

  id: string;

  private static _scope: Scope;

  static scope(): Scope {
    return this._scope || new Scope(this);
  }

  constructor(attributes?: Object) {
    for(var key in attributes) {
      this[key] = attributes[key];
    }
  }

  static all() : Promise<Array<Model>> {
    return this.scope().all();
  }

  static find(id) : Promise<Model> {
    return this.scope().find(id);
  }

  // private

  private static _url(id?: string) : string {
    let base = `${this.baseUrl}${this.apiNamespace}${this.endpoint}`;

    if (id) {
      base = `${base}/${id}`;
    }

    return base;
  }

  private static _fetch(url) : Promise<Object> {
    return new Promise((resolve, reject) => {
      fetch(url).then((response) => {
        response.json().then((json) => {
          resolve(json);
        });
      });
    });
  }

}
