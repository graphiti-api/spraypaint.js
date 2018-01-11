import { JSORMBase } from "../model";
import { IResultProxy } from "./index";
import { JsonapiResponseDoc } from "../jsonapi-spec";
export declare class CollectionProxy<T extends JSORMBase> implements IResultProxy<T> {
    private _raw_json;
    private _collection;
    constructor(collection: T[], raw_json?: JsonapiResponseDoc);
    readonly raw: JsonapiResponseDoc;
    readonly data: T[];
    readonly meta: Record<string, any>;
}
