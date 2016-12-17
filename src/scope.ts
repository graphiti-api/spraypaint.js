import Model from './model';

export default class Scope {
  model: typeof Model;

  constructor(model : typeof Model) {
    this.model = model;
  }

  all() : Promise<Array<Model>> {
    return new Promise((resolve, reject) => {
      this._fetch(this._url()).then((json : japiDocArray) => {
        let records = json.data.map((datum : japiResource) => {
          return this._newFromJSON(datum);
        });
        resolve(records);
      });
    });
  }

  find(id) : Promise<Model> {
    return new Promise((resolve, reject) => {
      this._fetch(this._url(id)).then((json : japiDoc) => {
        resolve(this._newFromJSON(json.data));
      });
    });
  }

  // private

  private _newFromJSON(resource : japiResource) : Model {
    let instance = new this.model({ id: resource.id });
    return instance;
  }

  private _url(id?: string) : string {
    let base = this.model.baseUrl;
    base = base + this.model.apiNamespace;
    base = base + this.model.endpoint;

    if (id) {
      base = `${base}/${id}`;
    }

    return base;
  }

  private _fetch(url) : Promise<Object> {
    return new Promise((resolve, reject) => {
      fetch(url).then((response) => {
        response.json().then((json) => {
          resolve(json);
        });
      });
    });
  }
}
