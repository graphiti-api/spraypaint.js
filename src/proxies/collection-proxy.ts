import Model from '../model';

class CollectionProxy<T> implements IResultProxy<T> {
  private _raw_json : japiDoc;
  private _array : Array<T>;

  constructor (raw_json : japiDoc = { data: [] }) {
    this.setRaw(raw_json);
  }

  get raw () : japiDoc {
    return this._raw_json;
  }

  get data () : Array<T> {
    return this._array;
  }

  get meta () : Object {
    return this.raw.meta || {};
  }

  private setRaw = (json_payload : japiDoc) => {
    this._raw_json = json_payload;

    this._array = [];

    this.raw.data.map((datum : japiResource) => {
      this._array.push(Model.fromJsonapi(datum, this.raw));
    });
  }
}

export default CollectionProxy;
