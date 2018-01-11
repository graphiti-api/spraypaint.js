import { JSORMBase } from "./model";
export declare class JsonapiTypeRegistry {
    private _typeMap;
    private _baseClass;
    constructor(base: typeof JSORMBase);
    register(type: string, model: typeof JSORMBase): void;
    get(type: string): typeof JSORMBase | undefined;
}
