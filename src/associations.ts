import Attribute from './attribute';
import Model from './model';

class Base extends Attribute {
  getter(context: Model) {
    return context.relationships[this.name];
  }

  setter(context: Model, val: any) : void {
    context.relationships[this.name] = val;
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

const hasMany = function() : HasMany {
  return new HasMany();
}

const hasOne = function() : HasOne {
  return new HasOne();
}

const belongsTo = function() : BelongsTo {
  return new BelongsTo();
}

export { hasMany, hasOne, belongsTo };
