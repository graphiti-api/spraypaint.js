import { JSORMBase } from '../model';
import { IncludeScopeHash } from './include-directive';
import { IncludeScope } from '../scope';
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
        })[keyof T]]?: Omit<T, "destroy" | "id" | "relationship" | "fromJsonapi" | "temp_id" | "relationships" | "klass" | "isType" | "isPersisted" | "isMarkedForDestruction" | "isMarkedForDisassociation" | "attributes" | "typedAttributes" | "assignAttributes" | "setMeta" | "relationshipResourceIdentifiers" | "resourceIdentifier" | "errors" | "hasError" | "clearErrors" | "isDirty" | "changes" | "hasDirtyRelation" | "dup" | "save" | "resetRelationTracking">[P][] | undefined;
    } & Partial<Record<"id" | "temp_id", string[]>>;
    private _isUnpersisted();
    private _hasDirtyAttributes();
    private _hasDirtyRelationships(includeHash);
    _eachRelatedObject(includeHash: IncludeScopeHash, callback: (key: string, object: JSORMBase, nested: IncludeScopeHash) => void): void;
}
export default DirtyChecker;
