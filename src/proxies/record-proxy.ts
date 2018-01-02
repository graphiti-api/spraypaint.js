import { JSORMBase } from '../model'
import { IResultProxy } from './index'

export class RecordProxy<T> implements IResultProxy<T> {
  private _raw_json : JsonapiResourceDoc;
  private _model : T | null;

  constructor (raw_json : JsonapiResourceDoc = { data: undefined }) {
    this.setRaw(raw_json);
  }

  get raw () : JsonapiResourceDoc {
    return this._raw_json;
  }

  get data () : T | null {
    return this._model;
  }

  get meta () : Object {
    return this.raw.meta || {};
  }

  private setRaw = (json_payload : JsonapiResourceDoc) => {
    this._raw_json = json_payload;

    if (this.raw.data) {
      this._model = JSORMBase.fromJsonapi(this.raw.data, this.raw);
    } else {
      this._model = null
    }
  }
}
