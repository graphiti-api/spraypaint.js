import Model from '../model';
import { camelize } from './string'

export default class ValidationErrors {
  model: Model;
  payload: Array<Object> = [];

  constructor(model: Model, payload: Array<Object>) {
    this.model = model;
    this.payload = payload;
  }

  static apply(model: Model, payload: Array<Object>) {
    let instance = new ValidationErrors(model, payload);
    let errors = instance.apply();
  }

  apply() {
    let errorsAccumulator = {}

    this.payload['errors'].forEach((err) => {
      let meta = err['meta'];
      let metaRelationship = meta['relationship'];

      if (metaRelationship) {
        this._processRelationship(this.model, metaRelationship);
      } else {
        this._processResource(errorsAccumulator, meta);
      }
    });

    this.model.errors = errorsAccumulator
  }

  private _processResource(errorsAccumulator: object, meta: Object) {
    let attribute = meta['attribute']

    if (this.model.klass.camelizeKeys) {
      attribute = camelize(attribute)
    }

    errorsAccumulator[attribute] = meta['message'];
  }

  private _processRelationship(model: Model, meta: Object) {
    let relatedObject = model[meta['name']];
    if (Array.isArray(relatedObject)) {
      relatedObject = relatedObject.find((r) => {
        return (r.id === meta['id'] || r.temp_id === meta['temp-id']);
      });
    }

    if (meta['relationship']) {
      this._processRelationship(relatedObject, meta['relationship']);
    } else {
      let relatedAccumulator = {}
      this._processResource(relatedAccumulator, meta);
      relatedObject.errors = relatedAccumulator
    }

  }
}
