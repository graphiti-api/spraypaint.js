export interface StorageBackend {
    getItem(key: string): string | null;
    setItem(key: string, value: string | null | undefined): void;
    removeItem(key: string): void;
}
export declare class NullStorageBackend implements StorageBackend {
    getItem(key: string): null;
    setItem(key: string, value: string | undefined): void;
    removeItem(key: string): void;
}
export declare class CredentialStorage {
    private _jwtKey;
    private _backend;
    constructor(jwtKey: string | false, backend?: StorageBackend);
    getJWT(): string | null;
    setJWT(value: string | undefined | null): void;
}
