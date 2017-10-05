import Model from '../model';
import IncludeDirective from './include-directive';

class DirtyChecker {
  model: Model;

  constructor(model: Model) {
    this.model = model;
  }

  // Check if we are switching persisted objects. Either:
  // * adding a new already-persisted object to a hasMany array
  // * switching an existing persisted hasOne/belongsTo object
  checkRelation(relationName: string, relatedModel: Model) : boolean {
    let dirty = false;

    if (relatedModel.isPersisted()) {
      let identifiers = this.model._originalRelationships[relationName] || [];
      let found = identifiers.find((ri) => {
        return JSON.stringify(ri) == JSON.stringify(relatedModel.resourceIdentifier);
      });
      if (!found) dirty = true;
    }

    return dirty;
  }

  // Either:
  // * attributes changed
  // * marked for destruction / disassociation
  // * not persisted (and thus must be send to server)
  // * not itself dirty, but has nested relations that are dirty
  check(relationships: Object | Array<any> | string = {}) : boolean {
    let includeDirective = new IncludeDirective(relationships);
    let includeHash = includeDirective.toObject();

    return this._hasDirtyAttributes() ||
      this._hasDirtyRelationships(includeHash) ||
      this.model.isMarkedForDestruction() ||
      this.model.isMarkedForDisassociation() ||
      this._isUnpersisted()
  }

  // TODO: allow attributes == {} configurable
  private _isUnpersisted() {
    return !this.model.isPersisted() && JSON.stringify(this.model.attributes) !== JSON.stringify({});
  }

  private _hasDirtyAttributes() {
    let originalAttrs = this.model._originalAttributes;
    let currentAttrs = this.model.attributes;

    return JSON.stringify(originalAttrs) !== JSON.stringify(currentAttrs);
  }

  private _hasDirtyRelationships(includeHash: Object) : boolean {
    let dirty = false;

    this._eachRelatedObject(includeHash, (relationName, relatedObject, nested) => {
      if (relatedObject.isDirty(nested)) {
        dirty = true;
      }

      if (this.checkRelation(relationName, relatedObject)) {
        dirty = true;
      }
    });

    return dirty;
  }

  _eachRelatedObject(includeHash: Object, callback: Function) : void {
    Object.keys(includeHash).forEach((key) => {
      let nested = includeHash[key];
      let relatedObjects = this.model[key];
      if (!Array.isArray(relatedObjects)) relatedObjects = [relatedObjects];
      relatedObjects.forEach((relatedObject) => {
        if (relatedObject) {
          callback(key, relatedObject, nested);
        }
      });
    });
  }
}

export default DirtyChecker;
