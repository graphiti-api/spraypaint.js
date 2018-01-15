import { JsonapiResponseDoc } from "../jsonapi-spec";
import { IResultProxy } from "./index";
export declare class NullProxy implements IResultProxy<null> {
    private _raw_json;
    constructor(raw_json: JsonapiResponseDoc);
    readonly raw: JsonapiResponseDoc;
    readonly data: null;
    readonly meta: Record<string, any>;
}
