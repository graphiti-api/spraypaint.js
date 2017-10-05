import Model from '../model';
import IncludeDirective from './include-directive';
import * as _snakeCase from './snakecase';
import uuid from './uuid';
let snakeCase: any = (<any>_snakeCase).default || _snakeCase;
snakeCase = snakeCase['default'] || snakeCase;

export default class WritePayload {
  model: Model;
  includeDirective: Object;
  included: Array<Object> = [];

  constructor(model : Model, relationships: string | Array<any> | Object) {
    let includeDirective = new IncludeDirective(relationships);
    this.includeDirective = includeDirective.toObject();
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

  removeDeletions(model: Model, includeDirective: Object) {
    Object.keys(includeDirective).forEach((key) => {
      let nested = includeDirective[key];

      let relatedObjects = model[key];
      if (relatedObjects) {
        if (Array.isArray(relatedObjects)) {
          relatedObjects.forEach((relatedObject, index) => {
            if (relatedObject.isMarkedForDestruction() || relatedObject.isMarkedForDisassociation()) {
              model[key].splice(index, 1);
            } else {
              this.removeDeletions(relatedObject, nested);
            }
          });
        } else {
          let relatedObject = relatedObjects;
          if (relatedObject.isMarkedForDestruction() || relatedObject.isMarkedForDisassociation()) {
            model[key] = null;
          } else {
            this.removeDeletions(relatedObject, nested);
          }
        }
      }
    });
  }

  postProcess() {
    this.removeDeletions(this.model, this.includeDirective);
    this.model.resetRelationTracking(this.includeDirective);
  }

  relationships() : Object {
    let _relationships = {};

    Object.keys(this.includeDirective).forEach((key) => {
      let nested = this.includeDirective[key];

      let data;
      let relatedModels = this.model[key];
      if (relatedModels) {
        if (Array.isArray(relatedModels)) {
          data = [];
          relatedModels.forEach((relatedModel) => {
            if (this.model.hasDirtyRelation(key, relatedModel) || relatedModel.isDirty(nested)) {
              data.push(this._processRelatedModel(relatedModel, nested));
            }
          });
          if (data.length === 0) data = null;
        } else {
          // Either the related model is dirty, or it's a dirty relation
          // (maybe the "department" is not dirty, but the employee changed departments
          if (this.model.hasDirtyRelation(key, relatedModels) || relatedModels.isDirty(nested)) {
            data = this._processRelatedModel(relatedModels, nested);
          }
        }

        if (data) {
          _relationships[key] = { data }
        }
      }
    });

    return _relationships;
  }

  asJSON() : Object {
    let data = {}

    this.model.clearErrors();

    if (this.model.id) {
      data['id'] = this.model.id;
    }

    if (this.model.temp_id) {
      data['temp-id'] = this.model.temp_id;
    }

    data['type'] = this.model.klass.jsonapiType;

    let _attributes = this.attributes()
    if (Object.keys(_attributes).length > 0) {
      data['attributes'] = _attributes;
    }

    let relationshipData = this.relationships();
    if (Object.keys(relationshipData).length > 0) {
      data['relationships'] = relationshipData;
    }

    let json = { data }
    if (this.included.length > 0) {
      json['included'] = this.included
    }

    return json;
  }

  // private

  private _processRelatedModel(model: Model, nested: Object) {
    model.clearErrors();

    if (!model.isPersisted()) {
      model.temp_id = uuid.generate();
    }

    let wp            = new WritePayload(model, nested);
    let relatedJSON   = wp.asJSON()['data'];

    let resourceIdentifier = this._resourceIdentifierFor(model);
    this._pushInclude(relatedJSON);
    wp.included.forEach((incl) => {
      this._pushInclude(incl);
    });
    return resourceIdentifier;
  }

  private _resourceIdentifierFor(model: Model) {
    let identifier = {};
    identifier['type'] = model.klass.jsonapiType;

    if (model.id) {
      identifier['id'] = model.id;
    }

    if (model.temp_id) {
      identifier['temp-id'] = model.temp_id;
    }

    let method;
    if (model.isPersisted()) {
      if (model.isMarkedForDestruction()) {
        method = 'destroy';
      } else if (model.isMarkedForDisassociation()) {
        method = 'disassociate';
      } else {
        method = 'update';
      }
    } else {
      method = 'create';
    }
    identifier['method'] = method;

    return identifier;
  }

  private _pushInclude(include: Object) {
    if (!this._isIncluded(include)) {
      this.included.push(include);
    };
  }

  private _isIncluded(include: Object) {
    this.included.forEach((incl) => {
      if (incl['type'] === include['type']) {
        if (incl['id'] === include['id'] || incl['temp-id'] === include['temp-id']) {
          return true;
        }
      }
    });
    return false;
  }

  private _eachAttribute(callback: Function) : void {
    let modelAttrs = this.model.attributes;
    Object.keys(modelAttrs).forEach((key) => {
      if (this.model.klass.attributeList[key].persist) {
        let value = modelAttrs[key];
        callback(key, value);
      }
    });
  }
}
