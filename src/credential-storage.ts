export interface StorageBackend {
  getItem(key: string): string | null
  setItem(key: string, value: string | null | undefined): void
  removeItem(key: string): void
}

export class InMemoryStorageBackend implements StorageBackend {
  private _data: Record<string, string | undefined>

  constructor() {
    this._data = {}
  }

  getItem(key: string): string | null {
    return this._data[key] || null // Cast undefined to null
  }
  setItem(key: string, value: string | undefined) {
    this._data[key] = value
  }
  removeItem(key: string) {
    delete this._data[key]
  }
}

let defaultBackend: StorageBackend

// In case no localStorage available, defauilt to a noop implementation
try {
  defaultBackend = localStorage
} catch (e) {
  defaultBackend = new InMemoryStorageBackend()
}

export class CredentialStorage {
  private _jwtKey: string
  private _backend: StorageBackend

  constructor(jwtKey: string, backend: StorageBackend = defaultBackend) {
    this._jwtKey = jwtKey
    this._backend = backend
  }

  get backend(): StorageBackend {
    return this._backend
  }

  getJWT(): string | undefined {
    return this._backend.getItem(this._jwtKey) || undefined
  }

  setJWT(value: string | undefined | null): void {
    if (value) {
      this._backend.setItem(this._jwtKey, value)
    } else {
      this._backend.removeItem(this._jwtKey)
    }
  }
}
