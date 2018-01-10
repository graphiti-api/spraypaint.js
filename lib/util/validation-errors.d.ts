import { JSORMBase } from '../model';
import { JsonapiResponseDoc } from '../jsonapi-spec';
export declare class ValidationErrors {
    model: JSORMBase;
    payload: JsonapiResponseDoc;
    constructor(model: JSORMBase, payload: JsonapiResponseDoc);
    static apply(model: JSORMBase, payload: JsonapiResponseDoc): void;
    apply(): void;
    private _processResource(errorsAccumulator, meta);
    private _processRelationship(model, meta);
}
