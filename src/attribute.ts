import { Model } from './model'

export type Attr<T> = { (): T } | { new (...args: any[]): T & object }

export type AttrType<T> = Attr<T>

export interface AttrRecord<T> {
  name?: string | symbol
  type?: AttrType<T>
  persist? : boolean
}

export function attr<T=any>(options? : AttrRecord<T>) : Attribute<T> {
  if (!options) {
    options = {}
  }

  return new Attribute<T>(options)
}

export type AttributeValue<Attributes> = {
  [K in keyof Attributes] : Attributes[K]
}

export type AttributeOptions = Partial<{
  name: string | symbol
  type : { () : any }
  persist : true
}>

export class Attribute<T=any> {
  public name : string | symbol
  public type? : T = undefined
  public persist : boolean = true
  public options? : AttrRecord<T>

  constructor(options: AttrRecord<T>) {
    this.options = options

    if (!options) {
      return
    }

    if (options.name) { this.name = options.name }

    if (options.type) {
      this.type = options.type as any as T
    }

    if (options.persist !== undefined) {
      this.persist = !!options.persist
    }
  }

  // The model calls this setter
  setter(context: Model, val: any) : void {
    context._attributes[this.name] = val;
  }

  // The model calls this getter
  getter(context: Model) : any {
    return context._attributes[this.name];
  }

  // This returns the getters/setters for use on the *model*
  descriptor(): PropertyDescriptor {
    let attr = this;

    return {
      enumerable: true,
      get() : any {
        return attr.getter(this);
      },

      set(value) : void {
        if (!value || !value.hasOwnProperty('isAttr')) {
          attr.setter(this, value);
        }
      }
    }
  }
}

const simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/

function assertType<T>(value: any, type: Attr<T>): {
  valid: boolean;
  expectedType: string;
} {
  let valid
  const expectedType = getType(type)
  if (simpleCheckRE.test(expectedType)) {
    const t = typeof value
    valid = t === expectedType.toLowerCase()
    // for primitive wrapper objects
    if (!valid && t === 'object') {
      valid = value instanceof type
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value)
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value)
  } else {
    valid = value instanceof type
  }
  return {
    valid,
    expectedType
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType(fn : Function) {
  const match = fn && fn.toString().match(/^\s*function (\w+)/)
  return match ? match[1] : ''
}

function isType<T>(type : Attr<T>, fn : Function) {
  if (!Array.isArray(fn)) {
    return getType(fn) === getType(type)
  }
  for (let i = 0, len = fn.length; i < len; i++) {
    if (getType(fn[i]) === getType(type)) {
      return true
    }
  }

  return false
}


/**
 * Get the raw type string of a value e.g. [object Object]
 */
const _toString = Object.prototype.toString

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isPlainObject (obj: any): boolean {
  return _toString.call(obj) === '[object Object]'
}


// export default class Attribute {
//   name: string;

//   persist: boolean = true;
//   isAttr: boolean = true;
//   isRelationship: boolean = false;

//   constructor(opts?: attributeOptions) {
//     if (opts && opts.hasOwnProperty('persist')) {
//       this.persist = opts.persist;
//     }
//   }

//   static applyAll(klass: typeof Model) : void {
//     this._eachAttribute(klass, (attr) => {
//       klass.attributeList[attr.name] = attr;
//       let descriptor = attr.descriptor();
//       Object.defineProperty(klass.prototype, attr.name, descriptor);
//       let instance = new klass();

//       let decorators = instance['__attrDecorators'] || [];
//       decorators.forEach((d) => {
//         if (d['attrName'] === attr.name) {
//           d['decorator'](klass.prototype, attr.name, descriptor);
//         }
//       });
//     });
//   }

//   private static _eachAttribute(klass: typeof Model, callback: Function) : void {
//     let instance = new klass();
//     for (let propName in instance) {
//       if (instance[propName] && instance[propName].hasOwnProperty('isAttr')) {

//         let attrInstance = instance[propName];
//         attrInstance.name = propName;

//         if (attrInstance.isRelationship) {
//           attrInstance.klass = Config.modelForType(attrInstance.jsonapiType || attrInstance.name);
//         }

//         callback(attrInstance);
//       }
//     }
//   }
// }
