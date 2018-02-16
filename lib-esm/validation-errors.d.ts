import { Omit } from "./util/omit";
import { JSORMBase } from "./model";
export interface IValidationError<T extends JSORMBase> {
    code: string;
    attribute: keyof ValidationErrors<T>;
    title: string;
    message: string;
    fullMessage: string;
    rawPayload: Record<string, any>;
}
export declare class ValidationError<T extends JSORMBase> implements IValidationError<T> {
    code: string;
    attribute: keyof ValidationErrors<T>;
    title: string;
    message: string;
    fullMessage: string;
    rawPayload: Record<string, any>;
    constructor(options: IValidationError<T>);
}
export declare type ValidationErrors<T extends JSORMBase> = ErrorAttrs<T, keyof (Omit<T, keyof JSORMBase>)>;
export declare type ErrorAttrs<T extends JSORMBase, K extends keyof T> = {
    [P in K]?: ValidationError<T>;
} & {
    base?: ValidationError<T>;
};
