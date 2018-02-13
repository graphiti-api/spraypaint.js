import { MiddlewareStack } from "./middleware-stack";
import { ILogger } from "./logger";
import { JsonapiResponseDoc, JsonapiRequestDoc } from "./jsonapi-spec";
export declare type RequestVerbs = keyof Request;
export interface JsonapiResponse extends Response {
    jsonPayload: JsonapiResponseDoc;
}
export declare class Request {
    middleware: MiddlewareStack;
    private logger;
    constructor(middleware: MiddlewareStack, logger: ILogger);
    get(url: string, options: RequestInit): Promise<any>;
    post(url: string, payload: JsonapiRequestDoc, options: RequestInit): Promise<any>;
    patch(url: string, payload: JsonapiRequestDoc, options: RequestInit): Promise<any>;
    delete(url: string, options: RequestInit): Promise<any>;
    private _logRequest(verb, url);
    private _logResponse(responseJSON);
    private _fetchWithLogging(url, options);
    private _fetch(url, options);
    private _handleResponse(response, requestOptions);
}
