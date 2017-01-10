import Model from './model';

class CollectionProxy<T> {
  private _raw_json : japiDoc;
  private _array : Array<T>;

  constructor (raw_json : japiDoc = { data: [], included: [] }) {
    this.setRaw(raw_json)
  }

  get raw () : japiDoc {
    return this._raw_json
  }

  get data () : Array<T> {
    return this._array
  }

  get collection () : Array<T> {
    return this._array
  }

  get meta () : Object {
    if (this.raw) {
      return this.raw.meta || {}
    }

    return {}
  }

  map (fn) {
    return this.data.map(fn)
  }

  private setRaw = (json_payload : japiDoc) => {
    this._raw_json = json_payload

    this._array = []

    if (this.raw.data) {
      this.raw.data.map((datum : japiResource) => {
        this._array.push(Model.fromJsonapi(datum, this.raw));
      });
    }
  }
}

export default CollectionProxy
