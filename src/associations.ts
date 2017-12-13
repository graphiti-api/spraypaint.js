import Attribute, { AttrRecord, Attr } from './attribute';
import Model from './model';

export interface AssociationRecord<T extends Model | undefined> extends AttrRecord<T> {
  type?: Attr<T>
}

export class AssociationBase<T extends Model> extends Attribute<T> {
  klass: typeof Model;
  // isRelationship = true;
  // jsonapiType: string;

  constructor(options: AssociationRecord<T>) {
    super(options);
  }

  // getter(context: Model) {
  //   return context.relationships[this.name];
  // }

  // setter(context: Model, val: any) : void {
  //   if (val && !val.hasOwnProperty('isRelationship')) {
  //     if (!(val instanceof Model) && !(Array.isArray(val))) {
  //       val = new this.klass(val);
  //     }
  //     context.relationships[this.name] = val;
  //   } else if (val === null || val === undefined) {
  //     context.relationships[this.name] = val;
  //   }
  // }
}

export class HasMany<T extends Model> extends AssociationBase<T> {
  // getter(context: Model) {
  //   let gotten = super.getter(context);
  //   if (!gotten) {
  //     this.setter(context, []);
  //     return super.getter(context);
  //   } else {
  //     return gotten;
  //   }
  // }
}

export class HasOne<T extends Model> extends AssociationBase<T> {
}

export class BelongsTo<T extends Model> extends AssociationBase<T> {
}

function hasMany<T extends Model>(options?: AssociationRecord<T>) : HasMany<T> {
  if (!options) {
    options = {}
  }

  return new HasMany(options);
}

function hasOne<T extends Model>(options?: AssociationRecord<T>) : HasOne<T> {
  if (!options) {
    options = {}
  }

  return new HasOne(options);
}

function belongsTo<T extends Model>(options?: AssociationRecord<T>) : BelongsTo<T> {
  if (!options) {
    options = {}
  }

  return new BelongsTo(options);
}

export { hasMany, hasOne, belongsTo };
