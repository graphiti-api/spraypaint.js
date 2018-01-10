export declare type BeforeFilter = (requestUrl: string, options: RequestInit) => void;
export declare type AfterFilter = (response: Response, json: JSON) => void;
export declare class MiddlewareStack {
    private _beforeFilters;
    private _afterFilters;
    constructor(before?: BeforeFilter[], after?: AfterFilter[]);
    readonly beforeFilters: BeforeFilter[];
    readonly afterFilters: AfterFilter[];
    beforeFetch(requestUrl: string, options: RequestInit): void;
    afterFetch(response: Response, json: JSON): void;
}
