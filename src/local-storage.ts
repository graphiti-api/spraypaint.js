export interface StorageBackend {
  getItem(key : string) : string | null
  setItem(key : string, value : string | null |undefined) : void
  removeItem(key : string) : void 
}

export class NullStorageBackend implements StorageBackend {
  getItem(key : string) { return null }
  setItem(key : string, value : string | undefined) { /*noop*/ }
  removeItem(key : string) { /*noop*/ }
}

let defaultBackend : StorageBackend

// In case no localStorage available, defauilt to a noop implementation
try {
  defaultBackend = localStorage
} catch(e) {
  defaultBackend = new NullStorageBackend()
}

export class LocalStorage {
  private _jwtKey : string | false
  private _backend : StorageBackend

  constructor(jwtKey : string | false, backend : StorageBackend = defaultBackend) {
    this._jwtKey = jwtKey
    this._backend = backend
  }

  getJWT() : string | null { 
    if (this._jwtKey) { 
      return this._backend.getItem(this._jwtKey) 
    } else {
      return null
    }
  }

  setJWT(value : string | undefined | null) : void {
    if (this._jwtKey) { 
      if (value) { 
        this._backend.setItem(this._jwtKey, value) 
      } else {
        this._backend.removeItem(this._jwtKey)
      }
    }
  }
}