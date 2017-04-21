import Model from '../model';

export default class ValidationErrors {
  model: Model;
  payload: Array<Object> = [];

  constructor(model: Model, payload: Array<Object>) {
    this.model = model;
    this.payload = payload;
  }

  static apply(model: Model, payload: Array<Object>) {
    let instance = new ValidationErrors(model, payload);
    instance.apply();
  }

  apply() {
    this.payload['errors'].forEach((err) => {
      let meta = err['meta'];
      let metaRelationship = meta['relationship'];

      if (metaRelationship) {
        this._processRelationship(this.model, metaRelationship);
      } else {
        this._processResource(this.model, meta);
      }
    });
  }

  private _processResource(model: Model, meta: Object) {
    model.errors[meta['attribute']] = meta['message'];
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
      this._processResource(relatedObject, meta);
    }
  }
}
