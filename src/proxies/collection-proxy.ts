import { JSORMBase } from '../model'
import { IResultProxy } from './index'

export class CollectionProxy<T> implements IResultProxy<T> {
  private _raw_json : JsonapiResponseDoc
  private _collection : Array<T>

  constructor (collection : T[], raw_json : JsonapiResponseDoc = { data: [] }) {
    this._collection = collection
    this._raw_json = raw_json
  }

  get raw () : JsonapiResponseDoc {
    return this._raw_json
  }

  get data () : Array<T> {
    return this._collection
  }

  get meta () : Object {
    return this.raw.meta || {}
  }
}