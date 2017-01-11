import Model from '../model';

class RecordProxy<T> implements IResultProxy<T> {
  private _raw_json : japiDoc;
  private _model : T;

  constructor (raw_json : japiDoc = { data: [] }) {
    this.setRaw(raw_json);
  }

  get raw () : japiDoc {
    return this._raw_json;
  }

  get data () : T {
    return this._model;
  }

  get meta () : Object {
    return this.raw.meta || {};
  }

  private setRaw = (json_payload : japiDoc) => {
    this._raw_json = json_payload;

    if (this.raw.data) {
      this._model = Model.fromJsonapi(this.raw.data, this.raw);
    } else {
      this._model = null
    }
  }
}

export default RecordProxy;
