import { JsonapiResponseDoc } from "../jsonapi-spec"
import { IResultProxy } from "./index"
import { PersistedSpraypaintRecord, SpraypaintBase } from "../model"

export class NullProxy<T extends SpraypaintBase = SpraypaintBase>
  implements IResultProxy<T> {
  private _raw_json: JsonapiResponseDoc

  constructor(raw_json: JsonapiResponseDoc) {
    this._raw_json = raw_json
  }

  get raw(): JsonapiResponseDoc {
    return this._raw_json
  }

  get data() {
    return null
  }

  get meta(): Record<string, any> {
    return this.raw.meta || {}
  }
}
