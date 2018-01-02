import { JSORMBase } from '../model'
import { IResultProxy } from './index'

export class CollectionProxy<T> implements IResultProxy<T> {
  private _raw_json : JsonapiCollectionDoc;
  private _array : Array<T>;

  constructor (raw_json : JsonapiCollectionDoc = { data: [] }) {
    this.setRaw(raw_json);
  }

  get raw () : JsonapiCollectionDoc {
    return this._raw_json;
  }

  get data () : Array<T> {
    return this._array;
  }

  get meta () : Object {
    return this.raw.meta || {};
  }

  private setRaw = (json_payload : JsonapiCollectionDoc) => {
    this._raw_json = json_payload;

    this._array = [];

    this.raw.data.map((datum : JsonapiResource) => {
      this._array.push(JSORMBase.fromJsonapi(datum, this.raw));
    });
  }
}