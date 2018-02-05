/* tslint:disable:member-ordering */
import { CollectionProxy, RecordProxy, NullProxy } from "./proxies"
import { ValidationErrors } from "./util/validation-errors"
import { refreshJWT } from "./util/refresh-jwt"
import relationshipIdentifiersFor from "./util/relationship-identifiers"
import { Request, RequestVerbs, JsonapiResponse } from "./request"
import { WritePayload } from "./util/write-payload"
import {
  CredentialStorage,
  NullStorageBackend,
  StorageBackend
} from "./credential-storage"
import { IDMap } from "./id-map"
import { deserialize, deserializeInstance } from "./util/deserialize"
import { Attribute } from "./attribute"
import DirtyChecker from "./util/dirty-check"
import {
  Scope,
  WhereClause,
  SortScope,
  FieldScope,
  StatsScope,
  IncludeScope
} from "./scope"
import { JsonapiTypeRegistry } from "./jsonapi-type-registry"
import { camelize } from "inflected"
import { ILogger, logger as defaultLogger } from "./logger"
import { MiddlewareStack, BeforeFilter, AfterFilter } from "./middleware-stack"
import { Omit } from "./util/omit"
import { EventBus } from "./event-bus"

import {
  JsonapiResource,
  JsonapiResponseDoc,
  JsonapiResourceIdentifier
} from "./jsonapi-spec"

import { cloneDeep } from "./util/clonedeep"
import { nonenumerable } from "./util/decorators"
import { IncludeScopeHash } from "./util/include-directive"

export interface ModelConfiguration {
  baseUrl: string
  apiNamespace: string
  jsonapiType: string
  endpoint: string
  jwt: string
  jwtStorage: string | false
  camelizeKeys: boolean
  strictAttributes: boolean
  logger: ILogger
}
export type ModelConfigurationOptions = Partial<ModelConfiguration>

export type ModelIdFields = "id" | "temp_id"

export type ModelAttrs<K extends keyof T, T extends JSORMBase> = {
  [P in K]?: T[P]
} &
  Partial<Record<ModelIdFields, string>>

export type ModelAttrChanges<T> = { [P in keyof T]?: T[P][] } &
  Partial<Record<ModelIdFields, string[]>>

export type ModelRecord<T extends JSORMBase> = ModelAttrs<
  keyof (Omit<T, keyof JSORMBase>),
  T
>

export type ModelAttributeChangeSet<T extends JSORMBase> = ModelAttrChanges<
  Omit<T, keyof JSORMBase>
>

export interface SaveOptions {
  with?: IncludeScope
}

export type ExtendedModel<
  Superclass extends typeof JSORMBase,
  Attributes,
  Methods,
  Prototype = Superclass["prototype"] & Attributes & Methods
> = {
  new (attrs?: Record<string, any>): Prototype
  prototype: Prototype
} & Superclass

export type AttrMap<T> = { [P in keyof T]: Attribute<T[P]> }

export type DefaultAttrs = Record<string, any>
export interface DefaultMethods<V> {
  [key: string]: (this: V, ...args: any[]) => any
}

export interface ExtendOptions<
  M,
  Attributes = DefaultAttrs,
  Methods = DefaultMethods<M>
> {
  static?: ModelConfigurationOptions
  attrs?: AttrMap<Attributes>
  methods?: ThisType<M & Attributes & Methods> & Methods
}

export const applyModelConfig = <T extends typeof JSORMBase>(
  ModelClass: T,
  config: ModelConfigurationOptions
): void => {
  let k: keyof ModelConfigurationOptions

  for (k in config) {
    if (config.hasOwnProperty(k)) {
      ModelClass[k] = config[k]
    }
  }

  if (ModelClass.isBaseClass === undefined) {
    ModelClass.setAsBase()
  } else if (ModelClass.isBaseClass === true) {
    ModelClass.isBaseClass = false
  }
}

export class JSORMBase {
  static baseUrl = "http://please-set-a-base-url.com"
  static apiNamespace = "/"
  static jsonapiType?: string
  static endpoint: string
  static isBaseClass: boolean
  static jwt?: string
  static camelizeKeys: boolean = true
  static strictAttributes: boolean = false
  static logger: ILogger = defaultLogger
  static sync: boolean = false

  static attributeList: Record<string, Attribute> = {}
  static extendOptions: any
  static parentClass: typeof JSORMBase
  static currentClass: typeof JSORMBase = JSORMBase
  static beforeFetch: BeforeFilter | undefined
  static afterFetch: AfterFilter | undefined
  static jwtStorage: string | false = "jwt"

  private static _typeRegistry: JsonapiTypeRegistry
  private static _IDMap: IDMap
  private static _middlewareStack: MiddlewareStack
  private static _credentialStorageBackend?: StorageBackend
  private static _credentialStorage?: CredentialStorage

  static get credentialStorage(): CredentialStorage {
    if (!this._credentialStorage) {
      if (!this._credentialStorageBackend) {
        if (this.jwtStorage && typeof localStorage !== "undefined") {
          this._credentialStorageBackend = localStorage
        } else {
          this._credentialStorageBackend = new NullStorageBackend()
        }
      }

      this._credentialStorage = new CredentialStorage(
        this.jwtStorage,
        this._credentialStorageBackend
      )
    }

    return this._credentialStorage
  }

  static set credentialStorageBackend(backend: StorageBackend | undefined) {
    this._credentialStorageBackend = backend
    this._credentialStorage = undefined
  }

  /*
   *
   * This is to allow for sane type checking in collaboration with the
   * isModelClass function exported below.  It is very hard to find out
   * whether something is a class of a certain type or subtype
   * (as opposed to an instance of that class), so we set a magic prop on
   * this for use around the codebase. For example, if you have a function:
   *
   * ``` typescript
   * function(arg : typeof JSORMBase | { foo : string }) {
   *   if(arg.isJSORMModel) {
   *     let modelClass : typeof JSORMBase = arg
   *   }
   * }
   * ```
   *
   */
  static readonly isJSORMModel: boolean = true

  static fromJsonapi(
    resource: JsonapiResource,
    payload: JsonapiResponseDoc
  ): any {
    return deserialize(this.typeRegistry, resource, payload)
  }

  static inherited(subclass: typeof JSORMBase): void {
    subclass.parentClass = this
    subclass.currentClass = subclass
    subclass.prototype.klass = subclass
    subclass.attributeList = cloneDeep(subclass.attributeList)
  }

  static setAsBase(): void {
    this.isBaseClass = true
    this.jsonapiType = undefined

    if (!this.typeRegistry) {
      this.typeRegistry = new JsonapiTypeRegistry(this)
    }

    if (!this.middlewareStack) {
      this._middlewareStack = new MiddlewareStack()
    }

    if (!this._IDMap) {
      this._IDMap = new IDMap()
    }

    const jwt = this.credentialStorage.getJWT()
    this.setJWT(jwt)
  }

  static isSubclassOf(maybeSuper: typeof JSORMBase): boolean {
    let current = this.currentClass

    while (current) {
      if (current === maybeSuper) {
        return true
      }

      current = current.parentClass
    }

    return false
  }

  static get baseClass() {
    let current = this.currentClass

    while (current) {
      if (current.isBaseClass) {
        return current
      }

      current = current.parentClass
    }
  }

  static get store(): IDMap {
    if (this.baseClass === undefined) {
      throw new Error(`No base class for ${this.name}`)
    }

    return this.baseClass._IDMap
  }

  static get typeRegistry(): JsonapiTypeRegistry {
    if (this.baseClass === undefined) {
      throw new Error(`No base class for ${this.name}`)
    }

    return this.baseClass._typeRegistry
  }

  static set typeRegistry(registry: JsonapiTypeRegistry) {
    if (!this.isBaseClass) {
      throw new Error("Cannot set a registry on a non-base class")
    }

    this._typeRegistry = registry
  }

  static registerType(): void {
    if (!this.jsonapiType) {
      return
    }

    const existingType = this.typeRegistry.get(this.jsonapiType)

    if (existingType) {
      // Don't try to register a type of we're looking
      // at a subclass. Otherwise we'll make a register
      // call which will fail in order to get a helpful
      // error message from the registry
      if (this.isSubclassOf(existingType)) {
        return
      }
    }

    this.typeRegistry.register(this.jsonapiType, this)
  }

  static extend<
    T extends typeof JSORMBase,
    ExtendedAttrs,
    Methods,
    SuperType = T
  >(
    this: T,
    options: ExtendOptions<T, ExtendedAttrs, Methods>
  ): ExtendedModel<T, ExtendedAttrs, Methods> {
    class Subclass extends (<ExtendedModel<typeof JSORMBase, {}, {}>>this) {}

    this.inherited(<any>Subclass)

    const attrs: any = {}
    if (options.attrs) {
      for (const key in options.attrs) {
        if (options.attrs.hasOwnProperty(key)) {
          const attr = options.attrs[key]

          if (!attr.name) {
            attr.name = key
          }

          attr.owner = <any>Subclass

          attrs[key] = attr
        }
      }
    }

    Subclass.attributeList = Object.assign({}, Subclass.attributeList, attrs)

    applyModelConfig(Subclass, options.static || {})

    Subclass.registerType()

    if (options.methods) {
      for (const methodName in options.methods) {
        if (options.methods.hasOwnProperty(methodName)) {
          ;(<any>Subclass.prototype)[methodName] = options.methods[methodName]
        }
      }
    }

    return <any>Subclass
  }

  id?: string
  temp_id?: string
  stale: boolean = false
  storeKey: string = ''

  @nonenumerable relationships: Record<string, JSORMBase | JSORMBase[]> = {}
  @nonenumerable klass: typeof JSORMBase

  @nonenumerable private _persisted: boolean = false
  @nonenumerable private _markedForDestruction: boolean = false
  @nonenumerable private _markedForDisassociation: boolean = false
  @nonenumerable
  private _originalRelationships: Record<
    string,
    JsonapiResourceIdentifier[]
  > = {}
  @nonenumerable private _attributes: ModelRecord<this>
  @nonenumerable private _originalAttributes: ModelRecord<this>
  @nonenumerable private __meta__: any
  @nonenumerable private _errors: object = {}

  constructor(attrs?: Record<string, any>) {
    this._initializeAttributes()
    this.assignAttributes(attrs)
    this._originalAttributes = cloneDeep(this._attributes)
    this._originalRelationships = this.relationshipResourceIdentifiers(
      Object.keys(this.relationships)
    )
  }

  private _initializeAttributes() {
    this._attributes = {}
    this._copyPrototypeDescriptors()
  }

  /*
   * VueJS, along with a few other frameworks rely on objects being "reactive". In practice, this
   * means that when passing an object into an context where you would need change detection, vue
   * will inspect it for any enumerable properties that exist and might be depended on in templates
   * and other functions that will trigger changes.  In the case of vue, it intentionally avoids
   * resolving properties on the prototype chain and instead determines which it should override
   * using `Object.hasOwnProperty()`.  To get proper observability, we need to move all attribute
   * methods plus a few other utility getters to the object itself.
   */
  private _copyPrototypeDescriptors() {
    const attrs = this.klass.attributeList

    for (const key in attrs) {
      if (attrs.hasOwnProperty(key)) {
        const attr = attrs[key]
        Object.defineProperty(this, key, attr.descriptor())
      }
    }

    ;[
      "errors",
      "isPersisted",
      "isMarkedForDestruction",
      "isMarkedForDisassociation"
    ].forEach(property => {
      const descriptor = Object.getOwnPropertyDescriptor(
        JSORMBase.prototype,
        property
      )

      if (descriptor) {
        Object.defineProperty(this, property, descriptor)
      }
    })
  }

  isType(jsonapiType: string) {
    return this.klass.jsonapiType === jsonapiType
  }

  get isPersisted(): boolean {
    return this._persisted
  }
  set isPersisted(val: boolean) {
    this._persisted = val
    if (!!val) this.reset()
  }

  _onStoreChange: Function
  private onStoreChange() : Function {
    if (this._onStoreChange) return this._onStoreChange
    this._onStoreChange =  (_event: any, attrs: any) => {
      Object.keys(attrs).forEach((k) => {
        let self = this as any
        if (self[k] !== attrs[k]) self[k] = attrs[k]
      })
    }
    return this._onStoreChange
  }

  unlisten() : void {
    if (!this.klass.sync) return
    if (this.storeKey) {
      EventBus.removeEventListener(this.storeKey, this.onStoreChange())
    }

    Object.keys(this.relationships).forEach((k) => {
      let related = this.relationships[k]

      if (related) {
        if (Array.isArray(related)) {
          related.forEach((r) => r.unlisten() )
        } else {
          related.unlisten()
        }
      }
    })
  }

  listen() : void {
    if (!this.klass.sync) return
    if (!this._onStoreChange) { // not already registered
      EventBus.addEventListener(this.storeKey, this.onStoreChange())
    }
  }

  reset() : void {
    if (this.klass.sync) {
      this.klass.store.updateOrCreate(this)
      this.listen()
    }
    this._originalAttributes = cloneDeep(this._attributes)
    this._originalRelationships = this.relationshipResourceIdentifiers(
      Object.keys(this.relationships)
    )
  }

  get isMarkedForDestruction(): boolean {
    return this._markedForDestruction
  }
  set isMarkedForDestruction(val: boolean) {
    this._markedForDestruction = val
  }

  get isMarkedForDisassociation(): boolean {
    return this._markedForDisassociation
  }
  set isMarkedForDisassociation(val: boolean) {
    this._markedForDisassociation = val
  }

  get attributes(): Record<string, any> {
    return this._attributes
  }

  get stored() {
    return this.klass.store.find(this)
  }

  set attributes(attrs: Record<string, any>) {
    this._attributes = {}
    this.assignAttributes(attrs)
  }

  /*
   * This is a (hopefully) temporary method for typescript users.
   *
   * Currently the attributes() setter takes an arbitrary hash which
   * may or may not include valid attributes. In non-strict mode, it
   * silently drops those that it doesn't know. This is all perfectly fine
   * from a functionality point, but it means we can't correctly type
   * the attributes() getter return object, as it must match the setter's
   * type. I propose we change the type definition to require sending
   * abitrary hashes through the assignAttributes() method instead.
   */
  get typedAttributes(): ModelRecord<this> {
    return this._attributes
  }

  relationship(name: string): JSORMBase[] | JSORMBase | undefined {
    return this.relationships[name]
  }

  assignAttributes(attrs?: Record<string, any>): void {
    if (!attrs) {
      return
    }
    for (const key in attrs) {
      if (attrs.hasOwnProperty(key)) {
        let attributeName = key

        if (this.klass.camelizeKeys) {
          attributeName = camelize(key, false)
        }

        if (key === "id" || this.klass.attributeList[attributeName]) {
          ;(<any>this)[attributeName] = attrs[key]
        } else if (this.klass.strictAttributes) {
          throw new Error(`Unknown attribute: ${key}`)
        }
      }
    }
  }

  setMeta(metaObj: object | undefined) {
    this.__meta__ = metaObj
  }

  relationshipResourceIdentifiers(relationNames: string[]) {
    return relationshipIdentifiersFor(this, relationNames)
  }

  fromJsonapi(
    resource: JsonapiResource,
    payload: JsonapiResponseDoc,
    includeDirective: IncludeScopeHash = {}
  ): any {
    return deserializeInstance(this, resource, payload, includeDirective)
  }

  get resourceIdentifier(): JsonapiResourceIdentifier {
    if (this.klass.jsonapiType === undefined) {
      throw new Error(
        "Cannot build resource identifier for class. No JSONAPI Type specified."
      )
    }

    return {
      id: this.id,
      type: this.klass.jsonapiType
    }
  }

  get errors() {
    return this._errors
  }

  set errors(errs: object) {
    this._errors = errs
  }

  get hasError() {
    return Object.keys(this._errors).length > 1
  }

  clearErrors() {
    this._errors = {}
  }

  isDirty(relationships?: IncludeScope): boolean {
    const dc = new DirtyChecker(this)
    return dc.check(relationships)
  }

  changes(): ModelAttributeChangeSet<this> {
    const dc = new DirtyChecker(this)
    return dc.dirtyAttributes()
  }

  hasDirtyRelation(relationName: string, relatedModel: JSORMBase): boolean {
    const dc = new DirtyChecker(this)
    return dc.checkRelation(relationName, relatedModel)
  }

  dup(): this {
    return cloneDeep(this)
  }

  /*
   *
   * Model Persistence Methods
   *
   */
  static fetchOptions(): RequestInit {
    const options = {
      headers: {
        Accept: "application/json",
        ["Content-Type"]: "application/json"
      } as any
    }

    const jwt = this.getJWT()
    if (jwt) {
      options.headers.Authorization = this.generateAuthHeader(jwt)
    }

    return options
  }

  static url(id?: string | number): string {
    const endpoint = this.endpoint || `/${this.jsonapiType}`
    let base = `${this.fullBasePath()}${endpoint}`

    if (id) {
      base = `${base}/${id}`
    }

    return base
  }

  static fullBasePath(): string {
    return `${this.baseUrl}${this.apiNamespace}`
  }

  static get middlewareStack(): MiddlewareStack {
    if (this.baseClass) {
      const stack = this.baseClass._middlewareStack

      // Normally we want to use the middleware stack defined on the baseClass, but in the event
      // that our subclass has overridden one or the other, we create a middleware stack that
      // replaces the normal filters with the class override.
      if (this.beforeFetch || this.afterFetch) {
        const before = this.beforeFetch
          ? [this.beforeFetch]
          : stack.beforeFilters
        const after = this.afterFetch ? [this.afterFetch] : stack.afterFilters

        return new MiddlewareStack(before, after)
      } else {
        return stack
      }
    } else {
      // Shouldn't ever get here, as this should only happen on JSORMBase
      return new MiddlewareStack()
    }
  }

  static set middlewareStack(stack: MiddlewareStack) {
    this._middlewareStack = stack
  }

  static scope<I extends typeof JSORMBase>(this: I): Scope<I> {
    return new Scope(this)
  }

  static first<I extends typeof JSORMBase>(this: I) {
    return this.scope().first()
  }

  static all<I extends typeof JSORMBase>(this: I) {
    return this.scope().all()
  }

  static find<I extends typeof JSORMBase>(this: I, id: string | number) {
    return this.scope().find(id)
  }

  static where<I extends typeof JSORMBase>(this: I, clause: WhereClause) {
    return this.scope().where(clause)
  }

  static page<I extends typeof JSORMBase>(this: I, pageNum: number) {
    return this.scope().page(pageNum)
  }

  static per<I extends typeof JSORMBase>(this: I, size: number) {
    return this.scope().per(size)
  }

  static order<I extends typeof JSORMBase>(
    this: I,
    clause: SortScope | string
  ) {
    return this.scope().order(clause)
  }

  static select<I extends typeof JSORMBase>(this: I, clause: FieldScope) {
    return this.scope().select(clause)
  }

  static selectExtra<I extends typeof JSORMBase>(this: I, clause: FieldScope) {
    return this.scope().selectExtra(clause)
  }

  static stats<I extends typeof JSORMBase>(this: I, clause: StatsScope) {
    return this.scope().stats(clause)
  }

  static includes<I extends typeof JSORMBase>(this: I, clause: IncludeScope) {
    return this.scope().includes(clause)
  }

  static merge<I extends typeof JSORMBase>(
    this: I,
    obj: Record<string, Scope>
  ) {
    return this.scope().merge(obj)
  }

  static setJWT(token: string | undefined | null): void {
    if (this.baseClass === undefined) {
      throw new Error(`Cannot set JWT on ${this.name}: No base class present.`)
    }

    this.baseClass.jwt = token || undefined
    this.credentialStorage.setJWT(token)
  }

  static getJWT(): string | undefined {
    const owner = this.baseClass

    if (owner) {
      return owner.jwt
    }
  }

  static generateAuthHeader(jwt: string): string {
    return `Token token="${jwt}"`
  }

  static getJWTOwner(): typeof JSORMBase | undefined {
    this.logger.warn(
      "JSORMBase#getJWTOwner() is deprecated. Use #baseClass property instead"
    )

    return this.baseClass
  }

  async destroy(): Promise<boolean> {
    const url = this.klass.url(this.id)
    const verb = "delete"
    const request = new Request(this._middleware(), this.klass.logger)
    let response: any

    try {
      response = await request.delete(url, this._fetchOptions())
    } catch (err) {
      throw err
    }

    let base = this.klass.baseClass as typeof JSORMBase
    base.store.destroy(this)

    return await this._handleResponse(response, () => {
      this.isPersisted = false
    })
  }

  async save(options: SaveOptions = {}): Promise<boolean> {
    let url = this.klass.url()
    let verb: RequestVerbs = "post"
    const request = new Request(this._middleware(), this.klass.logger)
    const payload = new WritePayload(this, options.with)
    let response: any

    if (this.isPersisted) {
      url = this.klass.url(this.id)
      verb = "put"
    }

    const json = payload.asJSON()

    try {
      response = await request[verb](url, json, this._fetchOptions())
    } catch (err) {
      throw err
    }

    return await this._handleResponse(response, () => {
      this.fromJsonapi(
        response.jsonPayload.data,
        response.jsonPayload,
        payload.includeDirective
      )
      payload.postProcess()
    })
  }

  private async _handleResponse(
    response: JsonapiResponse,
    callback: () => void
  ): Promise<boolean> {
    refreshJWT(this.klass, response)

    if (response.status === 422) {
      ValidationErrors.apply(this, response.jsonPayload)
      return false
    } else {
      callback()
      return true
    }
  }

  private _fetchOptions(): RequestInit {
    return this.klass.fetchOptions()
  }

  private _middleware(): MiddlewareStack {
    return this.klass.middlewareStack
  }

  // Todo:
  // * needs to recurse the directive
  // * remove the corresponding code from isPersisted and handle here (likely
  // only an issue with test setup)
  // * Make all calls go through resetRelationTracking();
  resetRelationTracking(includeDirective: object) {
    this._originalRelationships = this.relationshipResourceIdentifiers(
      Object.keys(includeDirective)
    )
  }
}

;(<any>JSORMBase.prototype).klass = JSORMBase

export const isModelClass = (arg: any): arg is typeof JSORMBase => {
  if (!arg) {
    return false
  }
  return arg.currentClass && arg.currentClass.isJSORMModel
}

export const isModelInstance = (arg: any): arg is JSORMBase => {
  if (!arg) {
    return false
  }
  return isModelClass(arg.constructor.currentClass)
}