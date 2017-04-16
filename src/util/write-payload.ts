import Model from '../model';
import * as _snakeCase from './snakecase';
let snakeCase: any = (<any>_snakeCase).default || _snakeCase;

export default class WritePayload {
  model: Model;

  constructor(model : Model) {
    this.model = model;
  }

  attributes() : Object {
    let attrs = {};

    this._eachAttribute((key, value) => {
      let snakeKey    = snakeCase(key);
      attrs[snakeKey] = value;
    });

    return attrs;
  }

  asJSON() : Object {
    let data = {}

    if (this.model.id) {
      data['id'] = this.model.id;
    }

    data['type'] = this.model.klass.jsonapiType;
    data['attributes'] = this.attributes();

    return { data };
  }

  // private

  private _eachAttribute(callback: Function) : void {
    let modelAttrs = this.model.attributes;
    Object.keys(modelAttrs).forEach((key) => {
      let value = modelAttrs[key];
      callback(key, value);
    });
  }
}
