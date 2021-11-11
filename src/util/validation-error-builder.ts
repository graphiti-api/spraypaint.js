import { SpraypaintBase } from "../model"
import {
  JsonapiResponseDoc,
  JsonapiError,
  JsonapiErrorMeta
} from "../jsonapi-spec"
import { ValidationErrors, ValidationError } from "../validation-errors"

export class ValidationErrorBuilder<T extends SpraypaintBase> {
  static apply<T extends SpraypaintBase>(
    model: T,
    payload: JsonapiResponseDoc
  ): void {
    const instance = new ValidationErrorBuilder(model, payload)
    instance.apply()
  }

  model: T
  payload: JsonapiResponseDoc

  constructor(model: T, payload: JsonapiResponseDoc) {
    this.model = model
    this.payload = payload
  }

  apply() {
    const errorsAccumulator: ValidationErrors<T> = {}

    if (!this.payload.errors) {
      return
    }

    this.payload.errors.forEach(err => {
      const meta = err.meta
      if (!meta) {
        throw new Error("invalid json")
      }
      const metaRelationship = meta.relationship

      if (metaRelationship) {
        this._processRelationship(this.model, metaRelationship, err)
      } else {
        this._processResource(errorsAccumulator, meta, err)
      }
    })

    this.model.errors = errorsAccumulator
  }

  private _processResource<R extends SpraypaintBase = T>(
    errorsAccumulator: ValidationErrors<R>,
    meta: JsonapiErrorMeta,
    error: JsonapiError
  ) {
    let attribute = this.model.klass.deserializeKey(meta.attribute)
    errorsAccumulator[attribute] = {
      title: error.title as string,
      code: error.code as string,
      attribute: meta.attribute,
      message: meta.message,
      fullMessage: attribute === "base" ? meta.message : error.detail,
      rawPayload: error
    }
  }

  private _processRelationship<R extends SpraypaintBase>(
    model: T,
    meta: JsonapiErrorMeta,
    err: JsonapiError
  ) {
    let relatedObject = model[model.klass.deserializeKey(meta.name)]
    if (Array.isArray(relatedObject)) {
      relatedObject = relatedObject.find(r => {
        // For now graphiti is returning the related object id as an integer
        // where the related object's ID is a string
        return (
          (r.id && String(r.id) === String(meta.id)) ||
          (r.temp_id && r.temp_id === meta["temp-id"])
        )
      })
    }

    if (meta.relationship) {
      this._processRelationship(relatedObject, meta.relationship, err)
    }
    else if (relatedObject) {
      const relatedAccumulator: ValidationErrors<R> = {}
      this._processResource(relatedAccumulator, meta, err)

      // make sure to assign a new error object, instead of mutating
      // the existing one, otherwise js frameworks with object tracking
      // won't be able to keep up. Validate vue.js when changing this code:
      const newErrs: ValidationErrors<R> = {}
      Object.keys(relatedObject.errors).forEach(key => {
        newErrs[key] = relatedObject.errors[key]
      })
      Object.keys(relatedAccumulator).forEach(key => {
        let error = relatedAccumulator[key]
        if (error !== undefined) {
          newErrs[key] = error
        }
      })
      relatedObject.errors = newErrs
    }
  }
}
