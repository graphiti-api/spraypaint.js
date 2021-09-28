import { SpraypaintBase, ModelRecord, ModelAttributeChangeSet } from "../model"
import { IncludeDirective, IncludeScopeHash } from "./include-directive"
import { IncludeScope } from "../scope"
import { JsonapiResourceIdentifier } from "../jsonapi-spec"
import { isEmpty } from "./isempty"

class DirtyChecker<T extends SpraypaintBase> {
  model: T

  constructor(model: T) {
    this.model = model
  }

  // Check if we are switching persisted objects. Either:
  // * adding a new already-persisted object to a hasMany array
  // * switching an existing persisted hasOne/belongsTo object
  checkRelation(relationName: string, relatedModel: SpraypaintBase): boolean {
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
      let prior = (<any>this.model)._originalAttributes[key]
      let current = this.model.attributes[key]

      let attrDef = this.model.klass.attributeList[key]

      if (attrDef.persist) {
        if (attrDef.type === Array) {
          prior = JSON.stringify(prior)
          current = JSON.stringify(current)
        }
        if (!this.model.isPersisted) {
          dirty[key] = [null, current]
        } else if (attrDef.dirtyChecker(prior, current)) {
          dirty[key] = [prior, current]
        }
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
    return !isEmpty(this.dirtyAttributes())
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
    callback: (
      key: string,
      object: SpraypaintBase,
      nested: IncludeScopeHash
    ) => void
  ): void {
    Object.keys(includeHash).forEach(key => {
      const nested = includeHash[key]
      let relatedObjects: SpraypaintBase[] | SpraypaintBase = (<any>this.model)[
        key
      ]

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
