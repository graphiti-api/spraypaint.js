// In the future, this class will be used for
// transforms, default values, etc.

import Model from './model';

export default class Attribute {
  name: string;

  isAttr: boolean = true;

  static applyAll(klass: typeof Model) : void {
    this._eachAttribute(klass, (attr) => {
      klass.attributeList.push(attr.name);

      Object.defineProperty(klass.prototype, attr.name, attr.getSet());
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

  // This returns the getters/setters for use on the *model*
  getSet() {
    let attr = this;

    return {
      get() : any {
        return attr.getter(this);
      },

      set(value) : void {
        if (!value.hasOwnProperty('isAttr')) {
          attr.setter(this, value);
        }
      }
    }
  }

  // The model calls this setter
  setter(context: Model, val: any) : void {
    context.attributes[this.name] = val;
  }

  // The model calls this getter
  getter(context: Model) : any {
    return context.attributes[this.name];
  }
}
