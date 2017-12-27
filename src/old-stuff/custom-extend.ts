// Override defined here w/noEmitHelpers
// https://github.com/Microsoft/TypeScript/issues/6425
// Allows 'inherited' hook

let globalObj;
if (typeof window === 'undefined') {
  globalObj = global;
} else {
  globalObj = window;
}

let originalSetPrototypeOf = Object['setPrototypeOf'];

const patchExtends = function() {
  Object['setPrototypeOf'] = function(subClass, superClass) {
    originalSetPrototypeOf(subClass, superClass);

    if(superClass['inherited']) {
      superClass['inherited'](subClass);
    }
  }

  globalObj['__extends'] = function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    if (b.inherited) b.inherited(d);
  };
}

export default patchExtends;
