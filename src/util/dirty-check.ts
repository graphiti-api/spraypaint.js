import { JSORMBase, ModelRecord, ModelAttributeChangeSet } from "../model"
import { IncludeDirective, IncludeScopeHash } from "./include-directive"
import { IncludeScope } from "../scope"
import { JsonapiResourceIdentifier } from "../jsonapi-spec"

class DirtyChecker<T extends JSORMBase> {
  model: T

  constructor(model: T) {
    this.model = model
  }

  // Check if we are switching persisted objects. Either:
  // * adding a new already-persisted object to a hasMany array
  // * switching an existing persisted hasOne/belongsTo object
  checkRelation(relationName: string, relatedModel: JSORMBase): boolean {
    let dirty = false

    if (relatedModel.isPersisted) {
      const identifiers: JsonapiResourceIdentifier[] =
        (<any>this.model)._originalRelationships[relationName] || []

      const found = identifiers.find(ri => {
        return (
          JSON.stringify(ri) === JSON.stringify(relatedModel.resourceIdentifier)
        )
      })
      if (!found) {
        dirty = true
      }
    }

    return dirty
  }

  // Either:
  // * attributes changed
  // * marked for destruction / disassociation
  // * not persisted (and thus must be send to server)
  // * not itself dirty, but has nested relations that are dirty
  check(relationships: IncludeScope = {}): boolean {
    const includeDirective = new IncludeDirective(relationships)
    const includeHash = includeDirective.toScopeObject()

    return (
      this._hasDirtyAttributes() ||
      this._hasDirtyRelationships(includeHash) ||
      this.model.isMarkedForDestruction ||
      this.model.isMarkedForDisassociation ||
      this._isUnpersisted()
    )
  }

  dirtyAttributes() {
    const dirty: ModelAttributeChangeSet<T> = {}

    for (const key of Object.keys(this.model.attributes)) {
      const prior = (<any>this.model)._originalAttributes[key]
      const current = this.model.attributes[key]

      if (!this.model.isPersisted) {
        dirty[key] = [null, current]
      } else if (prior !== current) {
        dirty[key] = [prior, current]
      }
    }

    return dirty
  }

  // TODO: allow attributes == {} configurable
  private _isUnpersisted() {
    return (
      !this.model.isPersisted &&
      JSON.stringify(this.model.attributes) !== JSON.stringify({})
    )
  }

  private _hasDirtyAttributes() {
    const originalAttrs = (<any>this.model)._originalAttributes
    const currentAttrs = this.model.attributes

    return JSON.stringify(originalAttrs) !== JSON.stringify(currentAttrs)
  }

  private _hasDirtyRelationships(includeHash: IncludeScopeHash): boolean {
    let dirty = false

    this._eachRelatedObject(
      includeHash,
      (relationName, relatedObject, nested) => {
        if (relatedObject.isDirty(nested)) {
          dirty = true
        }

        if (this.checkRelation(relationName, relatedObject)) {
          dirty = true
        }
      }
    )

    return dirty
  }

  private _eachRelatedObject(
    includeHash: IncludeScopeHash,
    callback: (key: string, object: JSORMBase, nested: IncludeScopeHash) => void
  ): void {
    Object.keys(includeHash).forEach(key => {
      const nested = includeHash[key]
      let relatedObjects: JSORMBase[] | JSORMBase = (<any>this.model)[key]

      if (!Array.isArray(relatedObjects)) {
        relatedObjects = [relatedObjects]
      }

      relatedObjects.forEach(relatedObject => {
        if (relatedObject) {
          callback(key, relatedObject, nested)
        }
      })
    })
  }
}

export default DirtyChecker
