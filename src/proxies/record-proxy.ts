import { JSORMBase } from '../model'
import { IResultProxy } from './index'

export class RecordProxy<T> implements IResultProxy<T> {
  private _raw_json : JsonapiResponseDoc;
  private _record : T | null;

  constructor (record : T | undefined | null, raw_json : JsonapiResponseDoc) {
    this._record = (record || null)
    this._raw_json = raw_json;
  }

  get raw () : JsonapiResponseDoc {
    return this._raw_json;
  }

  get data () : T | null {
    return this._record;
  }

  get meta () : Object {
    return this.raw.meta || {};
  }
}
