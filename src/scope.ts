import Model from './model';
import Config from './configuration';
import parameterize from './util/parameterize';
import IncludeDirective from './util/include-directive';
import { CollectionProxy, RecordProxy } from './proxies';
import Request from './request';
import colorize from './util/colorize';
import * as _cloneDeep from './util/clonedeep';
let cloneDeep: any = (<any>_cloneDeep).default || _cloneDeep;
cloneDeep = cloneDeep.default || cloneDeep;

export default class Scope {
  model: typeof Model;
  _associations: Object = {};
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
      let collection = new CollectionProxy<Model>(json);
      return collection;
    });
  }

  find(id : string | number) : Promise<RecordProxy<Model>> {
    return this._fetch(this.model.url(id)).then((json : japiDoc) => {
      return new RecordProxy<Model>(json);
    });
  }

  first() : Promise<RecordProxy<Model>> {
    let newScope = this.per(1);
    return newScope._fetch(newScope.model.url()).then((json : japiDoc) => {
      json.data = json.data[0];
      return new RecordProxy<Model>(json);
    });
  }

  merge(obj : Object) : Scope {
    let copy = this.copy();

    Object.keys(obj).forEach((k) => {
      copy._associations[k] = obj[k];
    })

    return copy;
  }

  page(pageNumber : number) : Scope {
    let copy = this.copy();

    copy._pagination.number = pageNumber;
    return copy;
  }

  per(size : number) : Scope {
    let copy = this.copy();

    copy._pagination.size = size;
    return copy;
  }

  where(clause: Object) : Scope {
    let copy = this.copy();

    for (let key in clause) {
      copy._filter[key] = clause[key];
    }
    return copy;
  }

  stats(clause: Object) : Scope {
    let copy = this.copy();

    for (let key in clause) {
      copy._stats[key] = clause[key];
    }
    return copy;
  }

  order(clause: Object | string) : Scope {
    let copy = this.copy();

    if (typeof clause == "object") {
      for (let key in clause) {
        copy._sort[key] = clause[key];
      }
    } else {
      copy._sort[clause] = 'asc';
    }

    return copy;
  }

  select(clause: Object) {
    let copy = this.copy();

    for (let key in clause) {
      copy._fields[key] = clause[key];
    }

    return copy;
  }

  selectExtra(clause: Object) {
    let copy = this.copy();

    for (let key in clause) {
      copy._extra_fields[key] = clause[key];
    }

    return copy;
  }

  includes(clause: Object | string | Array<any>) : Scope {
    let copy = this.copy();

    let directive = new IncludeDirective(clause);
    let directiveObject = directive.toObject();

    for (let key in directiveObject) {
      copy._include[key] = directiveObject[key];
    }

    return copy;
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
    qp['sort']          = this._sortParam(this._sort) || [];
    qp['fields']        = this._fields;
    qp['extra_fields']  = this._extra_fields;
    qp['stats']         = this._stats;
    qp['include']       = new IncludeDirective(this._include).toString();

    this._mergeAssociationQueryParams(qp, this._associations);

    return qp;
  }

  toQueryParams() : string | void {
    let paramString = parameterize(this.asQueryParams());

    if (paramString !== '') {
      return paramString;
    }
  }

  copy() : Scope {
    let newScope = cloneDeep(this);

    return newScope;
  }

  // private

  private _mergeAssociationQueryParams(queryParams, associations) {
    for (let key in associations) {
      let associationScope = associations[key];
      let associationQueryParams = associationScope.asQueryParams();

      queryParams['page'][key]   = associationQueryParams['page'];
      queryParams['filter'][key] = associationQueryParams['filter'];
      queryParams['stats'][key]  = associationQueryParams['stats'];

      associationQueryParams['sort'].forEach((s) => {
        let transformed = this._transformAssociationSortParam(key, s);
        queryParams['sort'].push(transformed);
      });
    }
  }

  private _transformAssociationSortParam(associationName: string, param : string) : string {
    if (param.indexOf('-') !== -1) {
      param = param.replace('-', '');
      associationName = `-${associationName}`;
    }
    return `${associationName}.${param}`;
  }

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
    let fetchOpts = this.model.fetchOptions()

    return request.get(url, fetchOpts).then((response) => {
      let jwtHeader = response.headers.get('X-JWT');
      if (jwtHeader) {
        this.model.setJWT(jwtHeader);
      }
      return response['jsonPayload'];
    });
  }
}
