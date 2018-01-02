import { JSORMBase } from '../model'
import { IResultProxy } from './index'

export class RecordProxy<T> implements IResultProxy<T> {
  private _raw_json : JsonapiDoc;
  private _record : T | null;

  constructor (record : T | undefined | null, raw_json : JsonapiDoc) {
    this._record = (record || null)
    this._raw_json = raw_json;
  }

  get raw () : JsonapiDoc {
    return this._raw_json;
  }

  get data () : T | null {
    return this._record;
  }

  get meta () : Object {
    return this.raw.meta || {};
  }
}
