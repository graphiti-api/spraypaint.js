/// <reference path="../index.d.ts" />
// use for non-typescript extends

let globalObj;
if (typeof window === 'undefined') {
  globalObj = global;
} else {
  globalObj = window;
}

export default function(superclass, classObj) {
  globalObj['__extends'](Model, superclass);
  function Model() {
    var _this = superclass.apply(this, arguments) || this;

    for (let prop in classObj) {
      if (prop !== 'static' && classObj.hasOwnProperty(prop)) {
        _this[prop] = classObj[prop];
      }
    }

    return _this;
  }

  for (let classProp in classObj.static) {
    Model[classProp] = classObj.static[classProp];
  }

  superclass.inherited(Model);
  return Model;
}
