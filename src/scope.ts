import { JSORMBase } from './model'
import parameterize from './util/parameterize'
import { IncludeDirective, IncludeArgHash, IncludeScopeHash } from './util/include-directive'
import { CollectionProxy, RecordProxy } from './proxies' 
import { Request } from './request'
import { refreshJWT } from './util/refresh-jwt'
import { cloneDeep } from './util/clonedeep'
import { 
  JsonapiResource,
  JsonapiResponseDoc,
  JsonapiCollectionDoc,
  JsonapiResourceDoc,
  JsonapiSuccessDoc
} from './jsonapi-spec'

export interface JsonapiQueryParams {
  page : AnyRecord,
  filter : AnyRecord,
  sort : string[], 
  fields : AnyRecord,
  extra_fields : AnyRecord,
  stats : AnyRecord,
  include? : string,
}

export type SortDir = 'asc' | 'desc'
export type SortScope = Record<string, SortDir>
export type FieldScope = Record<string, string[]>
export type WhereClause = Record<string, string | number | boolean>
export type StatsScope = Record<string, string | string[]>
export type IncludeScope = string | IncludeArgHash | (string | IncludeArgHash)[]

export type AnyRecord = Record<string, any>

export class Scope<T extends typeof JSORMBase=typeof JSORMBase> {
  model : T
  private _associations : Record<string, Scope<any>> = {}
  private _pagination : { number? : number, size? : number } = {}
  private _filter : WhereClause = {}
  private _sort : Record<string, SortDir> = {}
  private _fields : FieldScope = {}
  private _extra_fields : FieldScope = {}
  private _include : IncludeScopeHash = {}
  private _stats : StatsScope = {}

  constructor(model : T) {
    this.model = model
  }

  async all() : Promise<CollectionProxy<T['prototype']>> {
    let response = await this._fetch(this.model.url()) as JsonapiCollectionDoc

    return this._buildCollectionResult(response)
  }

  async find(id : string | number) : Promise<RecordProxy<T['prototype']>> {
    let json = await this._fetch(this.model.url(id)) as JsonapiResourceDoc

    return this._buildRecordResult(json)
  }

  async first() : Promise<RecordProxy<T['prototype']>> {
    let newScope = this.per(1)
    let rawResult 

    rawResult = await newScope._fetch(newScope.model.url()) as JsonapiCollectionDoc

    return this._buildRecordResult(rawResult)
  }

  merge(obj : Record<string, Scope>) : Scope<T> {
    let copy = this.copy()

    Object.keys(obj).forEach((k) => {
      copy._associations[k] = (obj as any)[k]
    })

    return copy
  }

  page(pageNumber : number) : Scope<T> {
    let copy = this.copy()

    copy._pagination.number = pageNumber
    return copy
  }

  per(size : number) : Scope<T> {
    let copy = this.copy()

    copy._pagination.size = size
    return copy
  }

  where(clause : WhereClause) : Scope<T> {
    let copy = this.copy()

    for (let key in clause) {
      copy._filter[key] = clause[key]
    }
    return copy
  }

  stats(clause : StatsScope) : Scope<T> {
    let copy = this.copy()

    for (let key in clause) {
      copy._stats[key] = clause[key]
    }
    return copy
  }

  order(clause : SortScope | string) : Scope<T> {
    let copy = this.copy()

    if (typeof clause === "object") {
      for (let key in clause) {
        copy._sort[key] = clause[key]
      }
    } else {
      copy._sort[clause] = 'asc'
    }

    return copy
  }

  select(clause : FieldScope) {
    let copy = this.copy()

    for (let key in clause) {
      copy._fields[key] = clause[key]
    }

    return copy
  }

  selectExtra(clause : FieldScope) {
    let copy = this.copy()

    for (let key in clause) {
      copy._extra_fields[key] = clause[key]
    }

    return copy
  }

  includes(clause : IncludeScope) : Scope<T> {
    let copy = this.copy()

    let directive = new IncludeDirective(clause)
    let directiveObject = directive.toScopeObject()

    for (let key in directiveObject) {
      copy._include[key] = directiveObject[key]
    }

    return copy
  }

  // The `Model` class has a `scope()` method to return the scope for it.
  // This method makes it possible for methods to expect either a model or
  // a scope and reliably cast them to a scope for use via `scope()`
  scope() : Scope<T> {
    return this
  }

  asQueryParams() : JsonapiQueryParams {
    let qp : JsonapiQueryParams = {
      page:         this._pagination,
      filter:       this._filter,
      sort:         this._sortParam(this._sort) || [],
      fields:       this._fields,
      extra_fields: this._extra_fields,
      stats:        this._stats,
      include:      new IncludeDirective(this._include).toString(),
    }

    this._mergeAssociationQueryParams(qp, this._associations)

    return qp
  }

  toQueryParams() : string | undefined {
    let paramString = parameterize(this.asQueryParams())

    if (paramString !== '') {
      return paramString
    }
  }

  copy() : Scope<T> {
    let newScope = cloneDeep(this)

    return newScope
  }

  // private

  private _mergeAssociationQueryParams(queryParams : JsonapiQueryParams, associations : Record<string, Scope<any>>) {
    for (let key in associations) {
      let associationScope = associations[key]
      let associationQueryParams = associationScope.asQueryParams()

      queryParams.page[key]   = associationQueryParams.page
      queryParams.filter[key] = associationQueryParams.filter
      queryParams.stats[key]  = associationQueryParams.stats

      associationQueryParams.sort.forEach((s) => {
        let transformed = this._transformAssociationSortParam(key, s)
        queryParams.sort.push(transformed)
      })
    }
  }

  private _transformAssociationSortParam(associationName : string, param : string) : string {
    if (param.indexOf('-') !== -1) {
      param = param.replace('-', '')
      associationName = `-${associationName}`
    }
    return `${associationName}.${param}`
  }

  private _sortParam(clause : Record<string, SortDir> | undefined) {
    if (clause && Object.keys(clause).length > 0) {
      let params = []

      for (let key in clause) {
        if (clause[key] !== 'asc') {
          key = `-${key}`
        }

        params.push(key)
      }

      return params
    }
  }

  private async _fetch(url : string) : Promise<JsonapiResponseDoc> {
    let qp = this.toQueryParams()
    if (qp) {
      url = `${url}?${qp}`
    }
    let request = new Request(this.model.middlewareStack, this.model.logger)
    let fetchOpts = this.model.fetchOptions()

    let response = await request.get(url, fetchOpts)
    refreshJWT(this.model, response)
    return response.jsonPayload
  }

  private _buildRecordResult(jsonResult : JsonapiSuccessDoc) {
    let record : T['prototype']

    let rawRecord : JsonapiResource
    if (jsonResult.data instanceof Array) {
      rawRecord = jsonResult.data[0]
    } else {
      rawRecord = jsonResult.data
    }

    record = this.model.fromJsonapi(rawRecord, jsonResult)

    return new RecordProxy(record, jsonResult)
  }

  private _buildCollectionResult(jsonResult : JsonapiCollectionDoc) {
    let recordArray : T['prototype'][] = []

    jsonResult.data.forEach((record) => {
      recordArray.push(this.model.fromJsonapi(record, jsonResult))
    })

    return new CollectionProxy(recordArray, jsonResult)
  }
}
