import { JSORMBase, ModelRecord } from '../model';
import { IncludeDirective, IncludeScopeHash } from './include-directive';
import { IncludeScope } from '../scope';
import { snakeCase } from './snakecase';
import { tempId } from './temp-id';
import { 
  JsonapiRequestDoc,
  JsonapiResourceIdentifier,
  JsonapiResourceMethod,
  JsonapiResource,
} from '../jsonapi-spec'

export class WritePayload<T extends JSORMBase> {
  model: T
  jsonapiType : string
  includeDirective: IncludeScopeHash
  included: Array<JsonapiResource> = []

  constructor(model : T, relationships?: IncludeScope) {
    let includeDirective = new IncludeDirective(relationships)
    this.includeDirective = includeDirective.toScopeObject()
    this.model = model

    if (!model.klass.jsonapiType) {
      throw new Error('Cannot serialize model: Undefined jsonapiType')
    }
    this.jsonapiType = model.klass.jsonapiType
  }

  attributes() {
    let attrs : ModelRecord<T> = {}

    this._eachAttribute((key, value) => {
      let snakeKey    = snakeCase(key);

      if (!this.model.isPersisted || this.model.changes()[key]) {
        attrs[snakeKey] = value;
      }
    });

    return attrs;
  }

  removeDeletions(model: T, includeDirective: IncludeScope) {
    Object.keys(includeDirective).forEach((key) => {
      let nested = (<any>includeDirective)[key];

      let modelIdx = (<any>model)
      let relatedObjects = modelIdx[key];
      if (relatedObjects) {
        if (Array.isArray(relatedObjects)) {
          relatedObjects.forEach((relatedObject, index) => {
            if (relatedObject.isMarkedForDestruction || relatedObject.isMarkedForDisassociation) {
              modelIdx[key].splice(index, 1);
            } else {
              this.removeDeletions(relatedObject, nested);
            }
          });
        } else {
          let relatedObject = relatedObjects;
          if (relatedObject.isMarkedForDestruction || relatedObject.isMarkedForDisassociation) {
            modelIdx[key] = null;
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
    let _relationships : any = {};

    Object.keys(this.includeDirective).forEach((key : any) => {
      let nested = (<any>this.includeDirective)[key];

      let data : any
      let relatedModels = (<any>this.model)[key];
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

  asJSON() : JsonapiRequestDoc {
    let data : JsonapiResource = {
      type: this.jsonapiType
    }

    this.model.clearErrors();

    if (this.model.id) {
      data['id'] = this.model.id;
    }

    if (this.model.temp_id) {
      data['temp-id'] = this.model.temp_id;
    }

    let _attributes = this.attributes()
    if (Object.keys(_attributes).length > 0) {
      data['attributes'] = _attributes;
    }

    let relationshipData = this.relationships();
    if (Object.keys(relationshipData).length > 0) {
      data['relationships'] = relationshipData;
    }

    let json : JsonapiRequestDoc = { data }

    if (this.included.length > 0) {
      json.included = this.included
    }

    return json
  }

  // private

  private _processRelatedModel(model: T, nested: IncludeScopeHash) {
    model.clearErrors();

    if (!model.isPersisted) {
      model.temp_id = tempId.generate()
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

  private _resourceIdentifierFor(model: T) {
    if (!model.klass.jsonapiType) {
      throw new Error(`Cannot serialize model: Undefined jsonapiType for model ${model}`)
    }

    let identifier : JsonapiResourceIdentifier = {
      type: model.klass.jsonapiType
    }

    if (model.id) {
      identifier['id'] = model.id;
    }

    if (model.temp_id) {
      identifier['temp-id'] = model.temp_id;
    }

    let method : JsonapiResourceMethod
    if (model.isPersisted) {
      if (model.isMarkedForDestruction) {
        method = 'destroy';
      } else if (model.isMarkedForDisassociation) {
        method = 'disassociate';
      } else {
        method = 'update';
      }
    } else {
      method = 'create';
    }
    identifier.method = method;

    return identifier;
  }

  private _pushInclude(include: any) {
    if (!this._isIncluded(include)) {
      this.included.push(include);
    };
  }

  private _isIncluded(include: any) {
    this.included.forEach((incl) => {
      if (incl['type'] === include['type']) {
        if (incl['id'] === include['id'] || incl['temp-id'] === include['temp-id']) {
          return true;
        }
      }
    });
    return false;
  }

  private _eachAttribute(callback: (key : keyof T, val : any) => void) : void {
    let modelAttrs = this.model.typedAttributes;

    Object.keys(modelAttrs).forEach((key) => {
      if (this.model.klass.attributeList[key].persist) {
        let value = modelAttrs[key];
        callback(key as keyof T, value);
      }
    })
  }
}
