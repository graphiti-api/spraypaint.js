type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T];  
type Omit<T, K extends keyof T> = {[P in Diff<keyof T, K>]: T[P]};  
