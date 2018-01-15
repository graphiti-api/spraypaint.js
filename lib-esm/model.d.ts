import { CollectionProxy, RecordProxy } from "./proxies";
import { LocalStorage, StorageBackend } from "./local-storage";
import { Attribute } from "./attribute";
import { Scope, WhereClause, SortScope, FieldScope, StatsScope, IncludeScope } from "./scope";
import { JsonapiTypeRegistry } from "./jsonapi-type-registry";
import { ILogger } from "./logger";
import { MiddlewareStack, BeforeFilter, AfterFilter } from "./middleware-stack";
import { JsonapiResource, JsonapiResponseDoc, JsonapiResourceIdentifier } from "./jsonapi-spec";
import { IncludeScopeHash } from "./util/include-directive";
export interface ModelConfiguration {
    baseUrl: string;
    apiNamespace: string;
    jsonapiType: string;
    endpoint: string;
    jwt: string;
    jwtLocalStorage: string | false;
    camelizeKeys: boolean;
    strictAttributes: boolean;
    logger: ILogger;
}
export declare type ModelConfigurationOptions = Partial<ModelConfiguration>;
export declare type ModelIdFields = "id" | "temp_id";
export declare type ModelAttrs<K extends keyof T, T extends JSORMBase> = {
    [P in K]?: T[P];
} & Partial<Record<ModelIdFields, string>>;
export declare type ModelAttrChanges<T> = {
    [P in keyof T]?: T[P][];
} & Partial<Record<ModelIdFields, string[]>>;
export declare type ModelRecord<T extends JSORMBase> = ModelAttrs<keyof (Omit<T, keyof JSORMBase>), T>;
export declare type ModelAttributeChangeSet<T extends JSORMBase> = ModelAttrChanges<Omit<T, keyof JSORMBase>>;
export interface SaveOptions {
    with?: IncludeScope;
}
export declare type ExtendedModel<Superclass extends typeof JSORMBase, Attributes, Methods, Prototype = Superclass["prototype"] & Attributes & Methods> = {
    new (attrs?: Record<string, any>): Prototype;
    prototype: Prototype;
} & Superclass;
export declare type AttrMap<T> = {
    [P in keyof T]: Attribute<T[P]>;
};
export declare type DefaultAttrs = Record<string, any>;
export interface DefaultMethods<V> {
    [key: string]: (this: V, ...args: any[]) => any;
}
export interface ExtendOptions<M, Attributes = DefaultAttrs, Methods = DefaultMethods<M>> {
    static?: ModelConfigurationOptions;
    attrs?: AttrMap<Attributes>;
    methods?: ThisType<M & Attributes & Methods> & Methods;
}
export declare const applyModelConfig: <T extends typeof JSORMBase>(ModelClass: T, config: Partial<ModelConfiguration>) => void;
export declare class JSORMBase {
    static baseUrl: string;
    static apiNamespace: string;
    static jsonapiType?: string;
    static endpoint: string;
    static isBaseClass: boolean;
    static jwt?: string;
    static camelizeKeys: boolean;
    static strictAttributes: boolean;
    static logger: ILogger;
    static attributeList: Record<string, Attribute>;
    static extendOptions: any;
    static parentClass: typeof JSORMBase;
    static currentClass: typeof JSORMBase;
    static beforeFetch: BeforeFilter | undefined;
    static afterFetch: AfterFilter | undefined;
    static jwtLocalStorage: string | false;
    private static _typeRegistry;
    private static _middlewareStack;
    private static _localStorageBackend?;
    private static _localStorage?;
    static readonly localStorage: LocalStorage;
    static localStorageBackend: StorageBackend | undefined;
    static readonly isJSORMModel: boolean;
    static fromJsonapi(resource: JsonapiResource, payload: JsonapiResponseDoc): any;
    static inherited(subclass: typeof JSORMBase): void;
    static setAsBase(): void;
    static isSubclassOf(maybeSuper: typeof JSORMBase): boolean;
    static readonly baseClass: typeof JSORMBase | undefined;
    static typeRegistry: JsonapiTypeRegistry;
    static registerType(): void;
    static extend<T extends typeof JSORMBase, ExtendedAttrs, Methods, SuperType = T>(this: T, options: ExtendOptions<T, ExtendedAttrs, Methods>): ExtendedModel<T, ExtendedAttrs, Methods>;
    id?: string;
    temp_id?: string;
    relationships: Record<string, JSORMBase | JSORMBase[]>;
    klass: typeof JSORMBase;
    private _persisted;
    private _markedForDestruction;
    private _markedForDisassociation;
    private _originalRelationships;
    private _attributes;
    private _originalAttributes;
    private __meta__;
    private _errors;
    constructor(attrs?: Record<string, any>);
    private _initializeAttributes();
    private _copyPrototypeDescriptors();
    isType(jsonapiType: string): boolean;
    isPersisted: boolean;
    isMarkedForDestruction: boolean;
    isMarkedForDisassociation: boolean;
    attributes: Record<string, any>;
    readonly typedAttributes: ModelRecord<this>;
    relationship(name: string): JSORMBase[] | JSORMBase | undefined;
    assignAttributes(attrs?: Record<string, any>): void;
    setMeta(metaObj: object | undefined): void;
    relationshipResourceIdentifiers(relationNames: string[]): Record<string, JsonapiResourceIdentifier[]>;
    fromJsonapi(resource: JsonapiResource, payload: JsonapiResponseDoc, includeDirective?: IncludeScopeHash): any;
    readonly resourceIdentifier: JsonapiResourceIdentifier;
    errors: object;
    readonly hasError: boolean;
    clearErrors(): void;
    isDirty(relationships?: IncludeScope): boolean;
    changes(): ModelAttributeChangeSet<this>;
    hasDirtyRelation(relationName: string, relatedModel: JSORMBase): boolean;
    dup(): this;
    static fetchOptions(): RequestInit;
    static url(id?: string | number): string;
    static fullBasePath(): string;
    static middlewareStack: MiddlewareStack;
    static scope<I extends typeof JSORMBase>(this: I): Scope<I>;
    static first<I extends typeof JSORMBase>(this: I): Promise<RecordProxy<I["prototype"]>>;
    static all<I extends typeof JSORMBase>(this: I): Promise<CollectionProxy<I["prototype"]>>;
    static find<I extends typeof JSORMBase>(this: I, id: string | number): Promise<RecordProxy<I["prototype"]>>;
    static where<I extends typeof JSORMBase>(this: I, clause: WhereClause): Scope<I>;
    static page<I extends typeof JSORMBase>(this: I, pageNum: number): Scope<I>;
    static per<I extends typeof JSORMBase>(this: I, size: number): Scope<I>;
    static order<I extends typeof JSORMBase>(this: I, clause: SortScope | string): Scope<I>;
    static select<I extends typeof JSORMBase>(this: I, clause: FieldScope): Scope<I>;
    static selectExtra<I extends typeof JSORMBase>(this: I, clause: FieldScope): Scope<I>;
    static stats<I extends typeof JSORMBase>(this: I, clause: StatsScope): Scope<I>;
    static includes<I extends typeof JSORMBase>(this: I, clause: IncludeScope): Scope<I>;
    static merge<I extends typeof JSORMBase>(this: I, obj: Record<string, Scope>): Scope<I>;
    static setJWT(token: string | undefined | null): void;
    static getJWT(): string | undefined;
    static generateAuthHeader(jwt: string): string;
    static getJWTOwner(): typeof JSORMBase | undefined;
    destroy(): Promise<boolean>;
    save(options?: SaveOptions): Promise<boolean>;
    private _handleResponse(response, callback);
    private _fetchOptions();
    private _middleware();
    resetRelationTracking(includeDirective: object): void;
}
export declare const isModelClass: (arg: any) => arg is typeof JSORMBase;
export declare const isModelInstance: (arg: any) => arg is JSORMBase;