import { SpraypaintBase } from "./model"

export class JsonapiTypeRegistry {
  private _typeMap: Record<string, typeof SpraypaintBase> = {}
  private _baseClass: typeof SpraypaintBase

  constructor(base: typeof SpraypaintBase) {
    this._baseClass = base
  }

  register(type: string, model: typeof SpraypaintBase) {
    if (this._typeMap[type]) {
      throw new Error(
        `Type "${type}" already registered on base class ${this._baseClass}`
      )
    }

    this._typeMap[type] = model
  }

  get(type: string): typeof SpraypaintBase | undefined {
    return this._typeMap[type]
  }
}
