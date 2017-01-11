import Attribute from './attribute';
import Model from './model';

class Base extends Attribute {
  klass: typeof Model;
  isRelationship = true;
  jsonapiType: string;

  constructor(...args) {
    super();
    this.jsonapiType = args[0];
  }

  getter(context: Model) {
    return context.relationships[this.name];
  }

  setter(context: Model, val: any) : void {
    if (!val.hasOwnProperty('isRelationship')) {
      if (!(val instanceof Model) && !(Array.isArray(val))) {
        val = new this.klass(val);
      }
      context.relationships[this.name] = val;
    }
  }
}

class HasMany extends Base {
  getter(context: Model) {
    let gotten = super.getter(context);
    if (!gotten) {
      this.setter(context, []);
      return super.getter(context);
    } else {
      return gotten;
    }
  }
}

class HasOne extends Base {
}

class BelongsTo extends Base {
}

const hasMany = function(...args) : HasMany {
  return new HasMany(...args);
}

const hasOne = function(...args) : HasOne {
  return new HasOne(...args);
}

const belongsTo = function(...args) : BelongsTo {
  return new BelongsTo(...args);
}

export { hasMany, hasOne, belongsTo };
