import { SpraypaintBase } from "./model"
import parameterize from "./util/parameterize"
import {
  IncludeDirective,
  IncludeArgHash,
  IncludeScopeHash
} from "./util/include-directive"
import { CollectionProxy, RecordProxy, NullProxy } from "./proxies"
import { Request } from "./request"
import { refreshJWT } from "./util/refresh-jwt"
import { cloneDeep } from "./util/clonedeep"
import {
  JsonapiResource,
  JsonapiResponseDoc,
  JsonapiCollectionDoc,
  JsonapiResourceDoc,
  JsonapiSuccessDoc
} from "./jsonapi-spec"

export interface JsonapiQueryParams {
  page: AnyRecord
  filter: AnyRecord
  sort: string[]
  fields: AnyRecord
  extra_fields: AnyRecord
  stats: AnyRecord
  include?: string
}

export type SortDir = "asc" | "desc"
export type SortScope = Record<string, SortDir>
export type FieldScope = Record<string, string[]>
export type FieldArg = FieldScope | string[]
export type WhereClause = any
export type StatsScope = Record<string, string | string[]>
export type IncludeScope = string | IncludeArgHash | (string | IncludeArgHash)[]

export type AnyRecord = Record<string, any>

export class Scope<T extends typeof SpraypaintBase = typeof SpraypaintBase> {
  model: T
  private _associations: Record<string, Scope<any>> = {}
  private _pagination: { number?: number; size?: number } = {}
  private _filter: WhereClause = {}
  private _sort: Record<string, SortDir> = {}
  private _fields: FieldScope = {}
  private _extra_fields: FieldScope = {}
  private _include: IncludeScopeHash = {}
  private _stats: StatsScope = {}
  private _extraParams: any = {}

  constructor(model: T) {
    this.model = model
  }

  async all(): Promise<CollectionProxy<T["prototype"]>> {
    const response = (await this._fetch(
      this.model.url()
    )) as JsonapiCollectionDoc

    return this._buildCollectionResult(response)
  }

  async find(id: string | number): Promise<RecordProxy<T["prototype"]>> {
    const json = (await this._fetch(this.model.url(id))) as JsonapiResourceDoc

    return this._buildRecordResult(json)
  }

  async first(): Promise<RecordProxy<T["prototype"]> | NullProxy> {
    const newScope = this.per(1)
    let rawResult

    rawResult = (await newScope._fetch(
      newScope.model.url()
    )) as JsonapiCollectionDoc

    return this._buildRecordResult(rawResult)
  }

  merge(obj: Record<string, Scope>): Scope<T> {
    const copy = this.copy()

    Object.keys(obj).forEach(k => {
      copy._associations[k] = (obj as any)[k]
    })

    return copy
  }

  page(pageNumber: number): Scope<T> {
    const copy = this.copy()

    copy._pagination.number = pageNumber
    return copy
  }

  per(size: number): Scope<T> {
    const copy = this.copy()

    copy._pagination.size = size
    return copy
  }

  where(clause: WhereClause): Scope<T> {
    const copy = this.copy()

    for (const key in clause) {
      if (clause.hasOwnProperty(key)) {
        copy._filter[key] = clause[key]
      }
    }
    return copy
  }

  extraParams(clause: any): Scope<T> {
    const copy = this.copy()

    for (const key in clause) {
      if (clause.hasOwnProperty(key)) {
        copy._extraParams[key] = clause[key]
      }
    }
    return copy
  }

  stats(clause: StatsScope): Scope<T> {
    const copy = this.copy()

    for (const key in clause) {
      if (clause.hasOwnProperty(key)) {
        copy._stats[key] = clause[key]
      }
    }
    return copy
  }

  order(clause: SortScope | string): Scope<T> {
    const copy = this.copy()

    if (typeof clause === "object") {
      for (const key in clause) {
        if (clause.hasOwnProperty(key)) {
          copy._sort[key] = clause[key]
        }
      }
    } else {
      copy._sort[clause] = "asc"
    }

    return copy
  }

  select(clause: FieldArg) {
    const copy = this.copy()

    if (Array.isArray(clause)) {
      let _clause = clause as string[]
      let jsonapiType = this.model.jsonapiType as string
      copy._fields[jsonapiType] = _clause
    } else {
      for (const key in clause) {
        if (clause.hasOwnProperty(key)) {
          copy._fields[key] = clause[key]
        }
      }
    }

    return copy
  }

  selectExtra(clause: FieldArg) {
    const copy = this.copy()

    if (Array.isArray(clause)) {
      let _clause = clause as string[]
      let jsonapiType = this.model.jsonapiType as string
      copy._extra_fields[jsonapiType] = _clause
    } else {
      for (const key in clause) {
        if (clause.hasOwnProperty(key)) {
          copy._extra_fields[key] = clause[key]
        }
      }
    }

    return copy
  }

  includes(clause: IncludeScope): Scope<T> {
    const copy = this.copy()

    const directive = new IncludeDirective(clause)
    const directiveObject = directive.toScopeObject()

    for (const key in directiveObject) {
      if (directiveObject.hasOwnProperty(key)) {
        copy._include[key] = directiveObject[key]
      }
    }

    return copy
  }

  // The `Model` class has a `scope()` method to return the scope for it.
  // This method makes it possible for methods to expect either a model or
  // a scope and reliably cast them to a scope for use via `scope()`
  scope(): Scope<T> {
    return this
  }

  asQueryParams(): JsonapiQueryParams {
    const qp: JsonapiQueryParams = {
      page: this._pagination,
      filter: this._filter,
      sort: this._sortParam(this._sort) || [],
      fields: this._fields,
      extra_fields: this._extra_fields,
      stats: this._stats,
      include: new IncludeDirective(this._include).toString()
    }

    this._mergeAssociationQueryParams(qp, this._associations)

    Object.keys(this._extraParams).forEach(k => {
      qp[k] = this._extraParams[k]
    })

    return qp
  }

  toQueryParams(): string | undefined {
    const paramString = parameterize(this.asQueryParams())

    if (paramString !== "") {
      return paramString
    }
  }

  copy(): Scope<T> {
    const newScope = cloneDeep(this)

    return newScope
  }

  // private

  private _mergeAssociationQueryParams(
    queryParams: JsonapiQueryParams,
    associations: Record<string, Scope<any>>
  ) {
    for (const key in associations) {
      if (associations.hasOwnProperty(key)) {
        const associationScope = associations[key]
        const associationQueryParams = associationScope.asQueryParams()

        queryParams.page[key] = associationQueryParams.page
        queryParams.filter[key] = associationQueryParams.filter
        queryParams.stats[key] = associationQueryParams.stats

        Object.assign(queryParams.fields, associationQueryParams.fields)
        Object.assign(
          queryParams.extra_fields,
          associationQueryParams.extra_fields
        )

        associationQueryParams.sort.forEach(s => {
          const transformed = this._transformAssociationSortParam(key, s)
          queryParams.sort.push(transformed)
        })
      }
    }
  }

  private _transformAssociationSortParam(
    associationName: string,
    param: string
  ): string {
    if (param.indexOf("-") !== -1) {
      param = param.replace("-", "")
      associationName = `-${associationName}`
    }
    return `${associationName}.${param}`
  }

  private _sortParam(clause: Record<string, SortDir> | undefined) {
    if (clause && Object.keys(clause).length > 0) {
      const params = []

      for (let key in clause) {
        if (clause.hasOwnProperty(key)) {
          if (clause[key] !== "asc") {
            key = `-${key}`
          }

          params.push(key)
        }
      }

      return params
    }
  }

  private async _fetch(url: string): Promise<JsonapiResponseDoc> {
    const qp = this.toQueryParams()
    if (qp) {
      url = `${url}?${qp}`
    }
    const request = new Request(this.model.middlewareStack, this.model.logger)
    const fetchOpts = this.model.fetchOptions()

    const response = await request.get(url, fetchOpts)
    refreshJWT(this.model, response)
    return response.jsonPayload
  }

  private _buildRecordResult(
    jsonResult: JsonapiResourceDoc
  ): RecordProxy<T["prototype"]>
  private _buildRecordResult(
    jsonResult: JsonapiCollectionDoc
  ): RecordProxy<T["prototype"]> | NullProxy
  private _buildRecordResult(jsonResult: JsonapiSuccessDoc) {
    let record: T["prototype"]

    let rawRecord: JsonapiResource
    if (jsonResult.data instanceof Array) {
      rawRecord = jsonResult.data[0]
      if (!rawRecord) {
        return new NullProxy(jsonResult)
      }
    } else {
      rawRecord = jsonResult.data
    }

    record = this.model.fromJsonapi(rawRecord, jsonResult)

    return new RecordProxy(record, jsonResult)
  }

  private _buildCollectionResult(jsonResult: JsonapiCollectionDoc) {
    const recordArray: T["prototype"][] = []

    jsonResult.data.forEach(record => {
      recordArray.push(this.model.fromJsonapi(record, jsonResult))
    })

    return new CollectionProxy(recordArray, jsonResult)
  }
}
