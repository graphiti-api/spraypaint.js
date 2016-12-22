import Model from './model';
import Config from './configuration';
import parameterize from './util/parameterize';
import IncludeDirective from './util/include-directive';

export default class Scope {
  model: typeof Model;
  _pagination: { number?: number, size?: number } = {};
  _filter: Object = {};
  _sort: Object = {};
  _fields: Object = {};
  _include: Object = {};

  constructor(model : typeof Model) {
    this.model = model;
  }

  all() : Promise<Array<Model>> {
    return this._fetch(this.model.url()).then((json : japiDoc) => {
      return json.data.map((datum : japiResource) => {
        return Model.fromJsonapi(datum, json);
      });
    });
  }

  find(id : string | number) : Promise<Model> {
    return this._fetch(this.model.url(id)).then((json : japiDoc) => {
      return Model.fromJsonapi(json.data, json);
    });
  }

  // TODO: paginate 1
  first() : Promise<Model> {
    return this.per(1).all().then((models : Array<Model>) => {
      return models[0];
    });
  }

  page(pageNumber : number) : Scope {
    this._pagination.number = pageNumber;
    return this;
  }

  per(size : number) : Scope {
    this._pagination.size = size;
    return this;
  }

  where(clause: Object) : Scope {
    for (let key in clause) {
      this._filter[key] = clause[key];
    }
    return this;
  }

  order(clause: Object | string) : Scope {
    if (typeof clause == "object") {
      for (let key in clause) {
        this._sort[key] = clause[key];
      }
    } else {
      this._sort[clause] = 'asc';
    }

    return this;
  }

  select(clause: Object) {
    for (let key in clause) {
      this._fields[key] = clause[key];
    }

    return this;
  }

  includes(clause: Object | string | Array<any>) : Scope {
    let directive = new IncludeDirective(clause);
    let directiveObject = directive.toObject();

    for (let key in directiveObject) {
      this._include[key] = directiveObject[key];
    }

    return this;
  }

  asQueryParams() : Object {
    let qp = {};

    qp['page']    = this._pagination;
    qp['filter']  = this._filter;
    qp['sort']    = this._sortParam(this._sort);
    qp['fields']  = this._fields;
    qp['include'] = new IncludeDirective(this._include).toString();

    return qp;
  }

  toQueryParams() : string | void {
    let paramString = parameterize(this.asQueryParams());

    if (paramString !== '') {
      return paramString;
    }
  }

  // private

  private _sortParam(clause: Object | void) {
    if (clause && Object.keys(clause).length > 0) {
      let params = [];

      for (let key in clause) {
        if (clause[key] !== 'asc') {
          key = `-${key}`
        }

        params.push(key);
      }

      return params;
    }
  }

  private _fetch(url : string) : Promise<Object> {
    let qp = this.toQueryParams();
    if (qp) {
      url = `${url}?${qp}`
    }

    return new Promise((resolve, reject) => {
      fetch(url).then((response) => {
        response.json().then((json) => {
          resolve(json);
        });
      });
    });
  }
}
