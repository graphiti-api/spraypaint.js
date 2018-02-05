import { JSORMBase } from "../model";
import { IncludeScopeHash } from "./include-directive";
import { IncludeScope } from "../scope";
import { JsonapiRequestDoc, JsonapiResource } from "../jsonapi-spec";
export declare class WritePayload<T extends JSORMBase> {
    model: T;
    jsonapiType: string;
    includeDirective: IncludeScopeHash;
    included: JsonapiResource[];
    idOnly: boolean;
    constructor(model: T, relationships?: IncludeScope, idOnly?: boolean);
    attributes(): {
        [P in ({
            [P in keyof T]: P;
        } & {
            reset: never;
            destroy: never;
            fromJsonapi: never;
            id: never;
            temp_id: never;
            stale: never;
            storeKey: never;
            relationships: never;
            klass: never;
            isType: never;
            isPersisted: never;
            _onStoreChange: never;
            unlisten: never;
            listen: never;
            isMarkedForDestruction: never;
            isMarkedForDisassociation: never;
            attributes: never;
            stored: never;
            typedAttributes: never;
            relationship: never;
            assignAttributes: never;
            setMeta: never;
            relationshipResourceIdentifiers: never;
            resourceIdentifier: never;
            errors: never;
            hasError: never;
            clearErrors: never;
            isDirty: never;
            changes: never;
            hasDirtyRelation: never;
            dup: never;
            save: never;
            resetRelationTracking: never;
        } & {
            [x: string]: never;
        })[keyof T]]?: T[P] | undefined;
    } & Partial<Record<"id" | "temp_id", string>>;
    removeDeletions(model: T, includeDirective: IncludeScope): void;
    postProcess(): void;
    relationships(): object;
    asJSON(): JsonapiRequestDoc;
    private _processRelatedModel(model, nested, idOnly);
    private _resourceIdentifierFor(model);
    private _pushInclude(include);
    private _isIncluded(include);
    private _eachAttribute(callback);
}
