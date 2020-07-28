// Not using Omit built-in utility type for TypeScript <= 3.5 support
export type TOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
