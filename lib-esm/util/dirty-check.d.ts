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
        })[keyof T]]?: {
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
            })[keyof T]]: T[P];
        }[P][] | undefined;
    } & Partial<Record<"id" | "temp_id", string[]>>;
    private _isUnpersisted();
    private _hasDirtyAttributes();
    private _hasDirtyRelationships(includeHash);
    private _eachRelatedObject(includeHash, callback);
}
export default DirtyChecker;
