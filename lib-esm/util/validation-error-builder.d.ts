import { JSORMBase } from "../model";
import { JsonapiResponseDoc } from "../jsonapi-spec";
export declare class ValidationErrorBuilder<T extends JSORMBase> {
    static apply<T extends JSORMBase>(model: T, payload: JsonapiResponseDoc): void;
    model: T;
    payload: JsonapiResponseDoc;
    constructor(model: T, payload: JsonapiResponseDoc);
    apply(): void;
    private _processResource(errorsAccumulator, meta, error);
    private _processRelationship<R>(model, meta, err);
}
