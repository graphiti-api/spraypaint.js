import { JSORMBase } from "../model";
import { IncludeScope } from "../scope";
declare class DirtyChecker<T extends JSORMBase> {
    model: T;
    constructor(model: T);
    checkRelation(relationName: string, relatedModel: JSORMBase): boolean;
    check(relationships?: IncludeScope): boolean;
    dirtyAttributes(): {
        [P in ({
            [P in keyof T]: P;
        } & {
            destroy: never;
            fromJsonapi: never;
            id: never;
            temp_id: never;
            relationships: never;
            klass: never;
            isType: never;
            isPersisted: never;
            isMarkedForDestruction: never;
            isMarkedForDisassociation: never;
            attributes: never;
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
        })[keyof T]]?: Omit<T, "destroy" | "fromJsonapi" | "id" | "temp_id" | "relationships" | "klass" | "isType" | "isPersisted" | "isMarkedForDestruction" | "isMarkedForDisassociation" | "attributes" | "typedAttributes" | "relationship" | "assignAttributes" | "setMeta" | "relationshipResourceIdentifiers" | "resourceIdentifier" | "errors" | "hasError" | "clearErrors" | "isDirty" | "changes" | "hasDirtyRelation" | "dup" | "save" | "resetRelationTracking">[P][] | undefined;
    } & Partial<Record<"id" | "temp_id", string[]>>;
    private _isUnpersisted();
    private _hasDirtyAttributes();
    private _hasDirtyRelationships(includeHash);
    private _eachRelatedObject(includeHash, callback);
}
export default DirtyChecker;
