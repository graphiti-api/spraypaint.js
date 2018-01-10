export declare enum LogLevel {
    debug = 1,
    info = 2,
    warn = 3,
    error = 4,
}
export declare type LogLevelKey = keyof (typeof LogLevel);
export interface ILogger {
    debug(stmt: any): void;
    info(stmt: any): void;
    warn(stmt: any): void;
    error(stmt: any): void;
    level: string;
}
export declare class Logger implements ILogger {
    private _level;
    constructor(level?: LogLevelKey | LogLevel);
    debug(stmt: any): void;
    info(stmt: any): void;
    warn(stmt: any): void;
    error(stmt: any): void;
    level: string;
}
export declare const logger: Logger;
