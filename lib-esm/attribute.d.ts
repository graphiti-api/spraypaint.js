import { JSORMBase } from "./model";
export declare type Attr<T> = (() => T) | {
    new (...args: any[]): T & object;
};
export declare type AttrType<T> = Attr<T>;
export interface AttrRecord<T> {
    name?: string | symbol;
    type?: AttrType<T>;
    persist?: boolean;
}
export declare const attr: <T = any>(options?: AttrRecord<T> | undefined) => Attribute<T>;
export declare type AttributeValue<Attributes> = {
    [K in keyof Attributes]: Attributes[K];
};
export declare type AttributeOptions = Partial<{
    name: string | symbol;
    type: () => any;
    persist: boolean;
}>;
export declare class Attribute<T = any> {
    isRelationship: boolean;
    name: string | symbol;
    type?: T;
    persist: boolean;
    owner: typeof JSORMBase;
    constructor(options: AttrRecord<T>);
    apply(ModelClass: typeof JSORMBase): void;
    setter(context: JSORMBase, val: any): void;
    getter(context: JSORMBase): any;
    descriptor(): PropertyDescriptor;
}
