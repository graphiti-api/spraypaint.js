export const nonenumerable = (target : any, key : string) => {
  // first property defined in prototype, that's why we use getters/setters
  // (otherwise assignment in object will override property in prototype)
  Object.defineProperty(target, key, {
    get() {
      return undefined
    },
    set(this : any, val) {
      // here we have reference to instance and can set property directly to it
      Object.defineProperty(this, key, {
        value: val,
        writable: true,
        enumerable: false,
      })
    },
    configurable: true,
    enumerable: false,
  })
}
