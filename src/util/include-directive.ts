export default class IncludeDirective {
  dct: Object = {};

  constructor(obj: string | Array<any> | Object) {
    let includeHash = this.parseIncludeArgs(obj);

    for (let key in includeHash) {
      this.dct[key] = new IncludeDirective(includeHash[key]);
    }
  }

  toObject() : Object {
    let hash = {};
    for (let key in this.dct) {
      hash[key] = this.dct[key].toObject();
    }
    return hash;
  }

  toString() : string {
    let stringArray = [];
    for (let key in this.dct) {
      let stringValue = this.dct[key].toString();

      if (stringValue === '') {
        stringArray.push(key);
      } else {
        stringValue = stringValue.split(',');
        stringValue = stringValue.map((x) => { return `${key}.${x}` });
        stringArray.push(stringValue.join(','));
      }
    }

    return stringArray.join(',');
  }

  parseIncludeArgs(includeArgs : string | Object | Array<any>) : Object {
    if (Array.isArray(includeArgs)) {
      return this._parseArray(includeArgs);
    } else if (typeof includeArgs == "string") {
      let obj = {};
      obj[includeArgs] = {};
      return obj;
    } else if (typeof includeArgs == "object") {
      return this._parseObject(includeArgs);
    } else {
      return {};
    }
  }

  // private

  private _parseObject(includeObj : Object) : Object {
    let parsed = {};
    for (let key in includeObj) {
      parsed[key] = this.parseIncludeArgs(includeObj[key]);
    }
    return parsed;
  }

  private _parseArray(includeArray: Array<any>) : Object {
    let parsed = {};
    for (let value of includeArray) {
      let parsedEl = this.parseIncludeArgs(value);
      for (let key in parsedEl) {
        parsed[key] = parsedEl[key];
      }
    }
    return parsed;
  }
}
