import { JSORMBase } from "./model"

export class JsonapiTypeRegistry {
  private _typeMap: Record<string, typeof JSORMBase> = {}
  private _baseClass: typeof JSORMBase

  constructor(base: typeof JSORMBase) {
    this._baseClass = base
  }

  register(type: string, model: typeof JSORMBase) {
    if (this._typeMap[type]) {
      throw new Error(
        `Type "${type}" already registered on base class ${this._baseClass}`
      )
    }

    this._typeMap[type] = model
  }

  get(type: string): typeof JSORMBase | undefined {
    return this._typeMap[type]
  }
}
