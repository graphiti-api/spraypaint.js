import { Attribute, AttrRecord, Attr } from "./attribute"
import { JSORMBase } from "./model"
import { JsonapiTypeRegistry } from "./jsonapi-type-registry"

export interface AssociationRecord<T extends JSORMBase> extends AttrRecord<T> {
  type?: Attr<T>
  jsonapiType?: string
}

export interface Association {
  isRelationship: true
  readonly klass: typeof JSORMBase
  jsonapiType: string
}

const wasDestroyed = (model: JSORMBase) => {
  if (!model.klass.sync) return false // not supported if idmap is off
  return (model.isPersisted || model.stale) && !model.stored
}

export class SingleAssociationBase<T extends JSORMBase> extends Attribute<T>
  implements Association {
  isRelationship: true = true
  jsonapiType: string
  typeRegistry: JsonapiTypeRegistry
  private _klass: typeof JSORMBase

  constructor(options: AssociationRecord<T>) {
    super(options)

    if (options.jsonapiType) {
      this.jsonapiType = options.jsonapiType
    }

    if (this.type) {
      this._klass = <any>this.type
    }
  }

  get klass(): typeof JSORMBase {
    if (!this._klass) {
      this._klass = modelForType(this, this.jsonapiType)
    }
    return this._klass
  }

  getter(context: JSORMBase) {
    let gotten = context.relationships[this.name] as JSORMBase | null
    if (gotten && wasDestroyed(gotten)) {
      delete context.relationships[this.name]
    }
    return context.relationships[this.name]
  }

  setter(context: JSORMBase, val: any): void {
    if (val && !val.hasOwnProperty("isRelationship")) {
      if (!(val instanceof JSORMBase) && !Array.isArray(val)) {
        val = new this.klass(val)
      }
      context.relationships[this.name] = val
    } else if (val === null || val === undefined) {
      context.relationships[this.name] = val
    }
  }
}

export class HasMany<T extends JSORMBase> extends Attribute<T[]>
  implements Association {
  isRelationship: true = true
  jsonapiType: string
  typeRegistry: JsonapiTypeRegistry
  private _klass: typeof JSORMBase

  constructor(options: AssociationRecord<T>) {
    super(options as any)

    if (options.jsonapiType) {
      this.jsonapiType = options.jsonapiType
    }

    if (this.type) {
      this._klass = <any>this.type
    }
  }

  get klass(): typeof JSORMBase {
    if (!this._klass) {
      this._klass = modelForType(this, this.jsonapiType)
    }
    return this._klass
  }

  getter(context: JSORMBase) {
    const gotten = context.relationships[this.name] as JSORMBase[]
    if (!gotten) {
      this.setter(context, [])
      return context.relationships[this.name]
    }

    context.relationships[this.name] = gotten.filter((g) => {
      return !wasDestroyed(g)
    })
    return context.relationships[this.name]
  }

  setter(context: JSORMBase, val: any): void {
    if (val && !val.hasOwnProperty("isRelationship")) {
      if (!(val instanceof JSORMBase) && !Array.isArray(val)) {
        val = new this.klass(val)
      }
      context.relationships[this.name] = val
    } else if (val === null || val === undefined) {
      context.relationships[this.name] = val
    }
  }
}

export class HasOne<T extends JSORMBase> extends SingleAssociationBase<T> {}

export class BelongsTo<T extends JSORMBase> extends SingleAssociationBase<T> {}

export interface AssociationFactoryOpts<T extends JSORMBase> {
  type?: string | Attr<T>
  persist?: boolean
  name?: string
}

export type AssociationFactoryArgs<T extends JSORMBase> =
  | AssociationFactoryOpts<T>
  | string

export const hasOne = <T extends JSORMBase>(
  options?: AssociationFactoryOpts<T>
): HasOne<T> => {
  const opts = extractAssocOpts(options)

  return new HasOne(opts)
}

export const belongsTo = <T extends JSORMBase>(
  options?: AssociationFactoryArgs<T>
): BelongsTo<T> => {
  const opts = extractAssocOpts(options)

  return new BelongsTo(opts)
}

export const hasMany = <T extends JSORMBase>(
  options?: AssociationFactoryArgs<T>
): HasMany<T> => {
  const opts = extractAssocOpts(options)

  return new HasMany(opts)
}

const extractAssocOpts = <T extends JSORMBase>(
  options?: AssociationFactoryArgs<T> | string
) => {
  let associationOpts: AssociationRecord<T> = {}

  if (options !== undefined) {
    if (typeof options === "string") {
      associationOpts = {
        jsonapiType: options
      }
    } else {
      associationOpts = {
        persist: options.persist,
        name: options.name
      }

      if (typeof options.type === "string") {
        associationOpts.jsonapiType = options.type
      } else {
        associationOpts.type = options.type as any
      }
    }
  }

  return associationOpts
}

interface ModelAssoc {
  owner: typeof JSORMBase
}

const modelForType = (
  association: ModelAssoc,
  jsonapiType: string
): typeof JSORMBase => {
  const klass = association.owner.typeRegistry.get(jsonapiType)

  if (klass) {
    return klass
  } else {
    throw new Error(`Unknown type "${jsonapiType}"`)
  }
}
