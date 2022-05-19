import { Attribute, AttrRecord, Attr } from "./attribute"
import { SpraypaintBase } from "./model"
import { JsonapiTypeRegistry } from "./jsonapi-type-registry"

export interface AssociationRecord<T extends SpraypaintBase>
  extends AttrRecord<T> {
  type?: Attr<T>
  jsonapiType?: string
}

export interface Association {
  isRelationship: true
  readonly klass: typeof SpraypaintBase
  jsonapiType: string
}

const wasDestroyed = (model: SpraypaintBase) => {
  if (!model.klass.sync) return false // not supported if idmap is off
  return (model.isPersisted || model.stale) && !model.stored
}

export class SingleAssociationBase<T extends SpraypaintBase>
  extends Attribute<T>
  implements Association {
  isRelationship: true = true
  jsonapiType!: string
  typeRegistry!: JsonapiTypeRegistry
  private _klass!: typeof SpraypaintBase

  constructor(options: AssociationRecord<T>) {
    super(options)

    if (options.jsonapiType) {
      this.jsonapiType = options.jsonapiType
    }

    if (this.type) {
      this._klass = <any>this.type
    }
  }

  get klass(): typeof SpraypaintBase {
    if (!this._klass) {
      this._klass = modelForType(this, this.jsonapiType)
    }
    return this._klass
  }

  getter(context: SpraypaintBase) {
    let gotten = context.relationships[this.name] as SpraypaintBase | null
    if (gotten && wasDestroyed(gotten)) {
      delete context.relationships[this.name]
    }
    return context.relationships[this.name]
  }

  setter(context: SpraypaintBase, val: any): void {
    if (val && !val.hasOwnProperty("isRelationship")) {
      if (!(val instanceof SpraypaintBase) && !Array.isArray(val)) {
        val = new this.klass(val)
      }
      context.relationships[this.name] = val
    } else if (val === null || val === undefined) {
      context.relationships[this.name] = val
    }
  }
}

export class HasMany<T extends SpraypaintBase> extends Attribute<T[]>
  implements Association {
  isRelationship: true = true
  jsonapiType!: string
  typeRegistry!: JsonapiTypeRegistry
  private _klass!: typeof SpraypaintBase

  constructor(options: AssociationRecord<T>) {
    super(options as any)

    if (options.jsonapiType) {
      this.jsonapiType = options.jsonapiType
    }

    if (this.type) {
      this._klass = <any>this.type
    }
  }

  get klass(): typeof SpraypaintBase {
    if (!this._klass) {
      this._klass = modelForType(this, this.jsonapiType)
    }
    return this._klass
  }

  getter(context: SpraypaintBase) {
    const gotten = context.relationships[this.name] as SpraypaintBase[]
    if (!gotten) {
      this.setter(context, [])
      return context.relationships[this.name]
    }

    let index = gotten.length
    while (index--) {
      if (wasDestroyed(gotten[index])) {
        let related = context.relationships[this.name] as SpraypaintBase[]
        gotten.splice(index, 1)
      }
    }

    return context.relationships[this.name]
  }

  setter(context: SpraypaintBase, val: any): void {
    if (val && !val.hasOwnProperty("isRelationship")) {
      if (!(val instanceof SpraypaintBase) && !Array.isArray(val)) {
        val = new this.klass(val)
      } else if (Array.isArray(val)) {
        val = val.map(v =>
          v instanceof SpraypaintBase ? v : new this.klass(v)
        )
      }

      context.relationships[this.name] = val
    } else if (val === null || val === undefined) {
      context.relationships[this.name] = val
    }
  }
}

export class HasOne<T extends SpraypaintBase> extends SingleAssociationBase<
  T
> {}

export class BelongsTo<T extends SpraypaintBase> extends SingleAssociationBase<
  T
> {}

export interface AssociationFactoryOpts<T extends SpraypaintBase> {
  type?: string | Attr<T>
  persist?: boolean
  name?: string
}

export type AssociationFactoryArgs<T extends SpraypaintBase> =
  | AssociationFactoryOpts<T>
  | string

export const hasOne = <T extends SpraypaintBase>(
  options?: AssociationFactoryOpts<T>
): HasOne<T> => {
  const opts = extractAssocOpts(options)

  return new HasOne(opts)
}

export const belongsTo = <T extends SpraypaintBase>(
  options?: AssociationFactoryArgs<T>
): BelongsTo<T> => {
  const opts = extractAssocOpts(options)

  return new BelongsTo(opts)
}

export const hasMany = <T extends SpraypaintBase>(
  options?: AssociationFactoryArgs<T>
): HasMany<T> => {
  const opts = extractAssocOpts(options)

  return new HasMany(opts)
}

const extractAssocOpts = <T extends SpraypaintBase>(
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
  owner: typeof SpraypaintBase
}

const modelForType = (
  association: ModelAssoc,
  jsonapiType: string
): typeof SpraypaintBase => {
  const klass = association.owner.typeRegistry.get(jsonapiType)

  if (klass) {
    return klass
  } else {
    throw new Error(`Unknown type "${jsonapiType}"`)
  }
}
