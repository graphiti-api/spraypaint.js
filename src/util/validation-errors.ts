import { JSORMBase } from "../model"
import { JsonapiResponseDoc, JsonapiErrorMeta } from "../jsonapi-spec"

export class ValidationErrors {
  static apply(model: JSORMBase, payload: JsonapiResponseDoc): void {
    const instance = new ValidationErrors(model, payload)
    instance.apply()
  }

  model: JSORMBase
  payload: JsonapiResponseDoc

  constructor(model: JSORMBase, payload: JsonapiResponseDoc) {
    this.model = model
    this.payload = payload
  }

  apply() {
    const errorsAccumulator = {}

    if (!this.payload.errors) {
      return
    }

    this.payload.errors.forEach(err => {
      const meta = err.meta
      const metaRelationship = meta.relationship

      if (metaRelationship) {
        this._processRelationship(this.model, metaRelationship)
      } else {
        this._processResource(errorsAccumulator, meta)
      }
    })

    this.model.errors = errorsAccumulator
  }

  private _processResource(
    errorsAccumulator: Record<string, string>,
    meta: JsonapiErrorMeta
  ) {
    let attribute = meta.attribute

    if (this.model.klass.camelizeKeys) {
      attribute = this.model.deserializeKey(attribute)
    }

    errorsAccumulator[attribute] = meta.message
  }

  private _processRelationship(model: JSORMBase, meta: JsonapiErrorMeta) {
    let relatedObject = (<any>model)[meta.name]
    if (Array.isArray(relatedObject)) {
      relatedObject = relatedObject.find(r => {
        return r.id === meta.id || r.temp_id === meta["temp-id"]
      })
    }

    if (meta.relationship) {
      this._processRelationship(relatedObject, meta.relationship)
    } else {
      const relatedAccumulator: Record<string, string> = {}
      this._processResource(relatedAccumulator, meta)

      // make sure to assign a new error object, instead of mutating
      // the existing one, otherwise js frameworks with object tracking
      // won't be able to keep up. Validate vue.js when changing this code:
      const newErrs: Record<string, string> = {}
      Object.keys(relatedObject.errors).forEach(key => {
        newErrs[key] = relatedObject.errors[key]
      })
      Object.keys(relatedAccumulator).forEach(key => {
        newErrs[key] = relatedAccumulator[key]
      })
      relatedObject.errors = newErrs
    }
  }
}
