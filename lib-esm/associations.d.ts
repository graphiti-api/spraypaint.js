import { Attribute, AttrRecord, Attr } from "./attribute";
import { JSORMBase } from "./model";
import { JsonapiTypeRegistry } from "./jsonapi-type-registry";
export interface AssociationRecord<T extends JSORMBase> extends AttrRecord<T> {
    type?: Attr<T>;
    jsonapiType?: string;
}
export interface Association {
    isRelationship: true;
    readonly klass: typeof JSORMBase;
    jsonapiType: string;
}
export declare class SingleAssociationBase<T extends JSORMBase> extends Attribute<T> implements Association {
    isRelationship: true;
    jsonapiType: string;
    typeRegistry: JsonapiTypeRegistry;
    private _klass;
    constructor(options: AssociationRecord<T>);
    readonly klass: typeof JSORMBase;
    getter(context: JSORMBase): JSORMBase | JSORMBase[];
    setter(context: JSORMBase, val: any): void;
}
export declare class HasMany<T extends JSORMBase> extends Attribute<T[]> implements Association {
    isRelationship: true;
    jsonapiType: string;
    typeRegistry: JsonapiTypeRegistry;
    private _klass;
    constructor(options: AssociationRecord<T>);
    readonly klass: typeof JSORMBase;
    getter(context: JSORMBase): JSORMBase | JSORMBase[];
    setter(context: JSORMBase, val: any): void;
}
export declare class HasOne<T extends JSORMBase> extends SingleAssociationBase<T> {
}
export declare class BelongsTo<T extends JSORMBase> extends SingleAssociationBase<T> {
}
export interface AssociationFactoryOpts<T extends JSORMBase> {
    type?: string | Attr<T>;
    persist?: boolean;
    name?: string;
}
export declare type AssociationFactoryArgs<T extends JSORMBase> = AssociationFactoryOpts<T> | string;
export declare const hasOne: <T extends JSORMBase>(options?: AssociationFactoryOpts<T> | undefined) => HasOne<T>;
export declare const belongsTo: <T extends JSORMBase>(options?: string | AssociationFactoryOpts<T> | undefined) => BelongsTo<T>;
export declare const hasMany: <T extends JSORMBase>(options?: string | AssociationFactoryOpts<T> | undefined) => HasMany<T>;
