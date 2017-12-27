import { Attribute, AttrRecord, Attr } from './attribute';
import { JSORMBase } from './model';

export interface AssociationRecord<T extends JSORMBase | undefined> extends AttrRecord<T> {
  type?: Attr<T>
}

export class AssociationBase<T extends JSORMBase> extends Attribute<T> {
  klass: typeof JSORMBase;
  // isRelationship = true;
  jsonapiType: string;

  constructor(options: AssociationRecord<T>) {
    super(options);
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

export class HasMany<T extends JSORMBase> extends AssociationBase<T> {
  getter(context: JSORMBase) {
    let gotten = super.getter(context);
    if (!gotten) {
      this.setter(context, []);
      return super.getter(context);
    } else {
      return gotten;
    }
  }
}

export class HasOne<T extends JSORMBase> extends AssociationBase<T> {
}

export class BelongsTo<T extends JSORMBase> extends AssociationBase<T> {
}

function hasMany<T extends JSORMBase>(options?: AssociationRecord<T>) : HasMany<T> {
  if (!options) {
    options = {}
  }

  return new HasMany(options);
}

function hasOne<T extends JSORMBase>(options?: AssociationRecord<T>) : HasOne<T> {
  if (!options) {
    options = {}
  }

  return new HasOne(options);
}

function belongsTo<T extends JSORMBase>(options?: AssociationRecord<T>) : BelongsTo<T> {
  if (!options) {
    options = {}
  }

  return new BelongsTo(options);
}

export { hasMany, hasOne, belongsTo };
