import { JSORMBase } from "./model";
export declare class IDMap {
    data: Record<string, any>;
    readonly count: number;
    find(model: JSORMBase, key?: string | null): any;
    findAll(models: JSORMBase[]): JSORMBase[];
    create(model: JSORMBase, key: string): void;
    updateOrCreate(model: JSORMBase): void;
    destroy(model: JSORMBase): void;
    private keyFor(model);
}
