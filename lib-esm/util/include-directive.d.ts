import { IncludeScope } from "../scope";
export interface IncludeArgHash {
    [key: string]: IncludeScope;
}
export interface IncludeScopeHash {
    [key: string]: IncludeScopeHash;
}
export declare class IncludeDirective {
    private dct;
    constructor(arg?: IncludeScope);
    toScopeObject(): IncludeScopeHash;
    toString(): string;
    private _parseIncludeArgs(includeArgs?);
    private _parseObject(includeObj);
    private _parseArray(includeArray);
}
