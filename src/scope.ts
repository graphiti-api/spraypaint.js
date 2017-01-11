import Model from './model';
import Config from './configuration';
import parameterize from './util/parameterize';
import IncludeDirective from './util/include-directive';
import CollectionProxy from './collection-proxy';
import Request from './request';
import colorize from './util/colorize';

export default class Scope {
  model: typeof Model;
  _pagination: { number?: number, size?: number } = {};
  _filter: Object = {};
  _sort: Object = {};
  _fields: Object = {};
  _extra_fields: Object = {};
  _include: Object = {};
  _stats: Object = {};

  constructor(model : typeof Model) {
    this.model = model;
  }

  all() : Promise<CollectionProxy<Model>> {
    return this._fetch(this.model.url()).then((json : japiDoc) => {
      let collection = new CollectionProxy(json);

      return  collection;
    });
  }

  find(id : string | number) : Promise<Model> {
    return this._fetch(this.model.url(id)).then((json : japiDoc) => {
      return Model.fromJsonapi(json.data, json);
    });
  }

  // TODO: paginate 1
  first() : Promise<Model> {
    return this.per(1).all().then((models : CollectionProxy<Model>) => {
      return models.data[0];
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

  stats(clause: Object) : Scope {
    for (let key in clause) {
      this._stats[key] = clause[key];
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

  selectExtra(clause: Object) {
    for (let key in clause) {
      this._extra_fields[key] = clause[key];
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

  // The `Model` class has a `scope()` method to return the scope for it.
  // This method makes it possible for methods to expect either a model or
  // a scope and reliably cast them to a scope for use via `scope()`
  scope() : Scope {
    return this;
  }

  asQueryParams() : Object {
    let qp = {};

    qp['page']          = this._pagination;
    qp['filter']        = this._filter;
    qp['sort']          = this._sortParam(this._sort);
    qp['fields']        = this._fields;
    qp['extra_fields']  = this._extra_fields;
    qp['stats']         = this._stats;
    qp['include']       = new IncludeDirective(this._include).toString();

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
      url = `${url}?${qp}`;
    }
    let request = new Request();
    return request.get(url);
  }
}
