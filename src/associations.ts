import { Attribute, AttrRecord, Attr } from './attribute';
import { JSORMBase, ModelConstructor } from './model';
import { JsonapiTypeRegistry } from './jsonapi-type-registry';

export interface AssociationRecord<T extends JSORMBase> extends AttrRecord<T> {
  type? : Attr<T>
  jsonapiType? : string
}

export interface Association {
  isRelationship : true
  readonly klass: typeof JSORMBase
  jsonapiType: string
}

export class SingleAssociationBase<T extends JSORMBase> extends Attribute<T> implements Association {
  isRelationship : true = true
  jsonapiType : string
  typeRegistry : JsonapiTypeRegistry
  private _klass : typeof JSORMBase

  constructor(options: AssociationRecord<T>) {
    super(options);

    if (options.jsonapiType) {
      this.jsonapiType = options.jsonapiType
    }

    if (this.type) {
      this._klass = <any>this.type
    }
  }

  get klass() : typeof JSORMBase {
    if (!this._klass) { 
      this._klass = modelForType(this, this.jsonapiType)
    }
    return this._klass 
  }

  getter(context: JSORMBase) {
    return context.relationships[this.name];
  }

  setter(context: JSORMBase, val: any) : void {
    if (val && !val.hasOwnProperty('isRelationship')) {
      if (!(val instanceof JSORMBase) && !(Array.isArray(val))) {
        val = new this.klass(val);
      }
      context.relationships[this.name] = val;
    } else if (val === null || val === undefined) {
      context.relationships[this.name] = val;
    }
  }
}

export class HasMany<T extends JSORMBase> extends Attribute<Array<T>> implements Association {
  isRelationship : true = true
  jsonapiType : string
  typeRegistry : JsonapiTypeRegistry
  private _klass : typeof JSORMBase

  constructor(options: AssociationRecord<T>) {
    super(options as any);

    if (options.jsonapiType) {
      this.jsonapiType = options.jsonapiType
    }

    if (this.type) {
      this._klass = <any>this.type
    }
  }

  get klass() : typeof JSORMBase {
    if (!this._klass) { 
      this._klass = modelForType(this, this.jsonapiType)
    }
    return this._klass 
  }

  getter(context: JSORMBase) {
    let gotten = context.relationships[this.name]
    if (!gotten) {
      this.setter(context, []);
      return context.relationships[this.name]
    } else {
      return gotten;
    }
  }

  setter(context: JSORMBase, val: any) : void {
    if (val && !val.hasOwnProperty('isRelationship')) {
      if (!(val instanceof JSORMBase) && !(Array.isArray(val))) {
        val = new this.klass(val);
      }
      context.relationships[this.name] = val;
    } else if (val === null || val === undefined) {
      context.relationships[this.name] = val;
    }
  }
}

export class HasOne<T extends JSORMBase> extends SingleAssociationBase<T> {
}

export class BelongsTo<T extends JSORMBase> extends SingleAssociationBase<T> {
}

export interface AssociationFactoryOpts<T extends JSORMBase> {
  type? : string | Attr<T>
  persist? : boolean
  name? : string
}

export type AssociationFactoryArgs<T extends JSORMBase> = AssociationFactoryOpts<T> | string

export function hasOne<T extends JSORMBase>(options?: AssociationFactoryOpts<T>) : HasOne<T> {
  let opts = extractAssocOpts(options)

  return new HasOne(opts)
}

export function belongsTo<T extends JSORMBase>(options?: AssociationFactoryArgs<T>) : BelongsTo<T> {
  let opts = extractAssocOpts(options)

  return new BelongsTo(opts)
}

export function hasMany<T extends JSORMBase>(options?: AssociationFactoryArgs<T>) : HasMany<T> {
  let opts = extractAssocOpts(options)

  return new HasMany(opts)
}

function extractAssocOpts<T extends JSORMBase>(options?: AssociationFactoryArgs<T> | string) {
  let associationOpts : AssociationRecord<T> = {}

  if (options !== undefined) {
    if(typeof options === 'string') {
      associationOpts = {
        jsonapiType: options
      }
    } else {
      associationOpts = {
        persist: options.persist,
        name: options.name,
      }

      if (typeof options.type === 'string') {
        associationOpts.jsonapiType = options.type
      } else {
        associationOpts.type = options.type as any
      }
    }
  }
  
  return associationOpts
}

type ModelAssoc = { owner: typeof JSORMBase }
function modelForType(association : ModelAssoc, jsonapiType : string) : typeof JSORMBase {
  let klass = association.owner.typeRegistry.get(jsonapiType)

  if (klass) {
    return klass
  } else {
    throw new Error(`Unknown type "${jsonapiType}"`)
  }
}