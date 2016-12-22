// In the future, this class will be used for
// transforms, default values, etc.

import Model from './model';

export default class Attribute {
  name: string;
  private _value: any;

  isAttr: boolean = true;

  static applyAll(klass: typeof Model) : void {
    this._eachAttribute(klass, (attr) => {
      klass.attributeList.push(attr.name);

      Object.defineProperty(klass.prototype, attr.name, {
        get() : any {
          return attr.getter(this);
        },

        set(value) : void {
          attr.setter(this, value);
        }
      });
    });
  }

  private static _eachAttribute(klass: typeof Model, callback: Function) : void {
    let instance = new klass();
    for (let propName in instance) {
      if (instance[propName] && instance[propName].hasOwnProperty('isAttr')) {
        let attrInstance = instance[propName];
        attrInstance.name = propName;
        callback(attrInstance);
      }
    }
  }

  setter(context: Model, val: any) : void {
    if (!val.hasOwnProperty('isAttr')) {
      context.attributes[this.name] = val;
    }
  }

  getter(context: Model) : any {
    return context.attributes[this.name];
  }
}
