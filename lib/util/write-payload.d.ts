import { JSORMBase } from '../model';
import { IncludeScopeHash } from './include-directive';
import { IncludeScope } from '../scope';
import { JsonapiRequestDoc, JsonapiResource } from '../jsonapi-spec';
export declare class WritePayload<T extends JSORMBase> {
    model: T;
    jsonapiType: string;
    includeDirective: IncludeScopeHash;
    included: Array<JsonapiResource>;
    constructor(model: T, relationships?: IncludeScope);
    attributes(): {
        [P in ({
            [P in keyof T]: P;
        } & {
            destroy: never;
            id: never;
            relationship: never;
            fromJsonapi: never;
            temp_id: never;
            relationships: never;
            klass: never;
            isType: never;
            isPersisted: never;
            isMarkedForDestruction: never;
            isMarkedForDisassociation: never;
            attributes: never;
            typedAttributes: never;
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
    relationships(): Object;
    asJSON(): JsonapiRequestDoc;
    private _processRelatedModel(model, nested);
    private _resourceIdentifierFor(model);
    private _pushInclude(include);
    private _isIncluded(include);
    private _eachAttribute(callback);
}
