export type IncludeScopeArg = string |  IncludeArgHash | Array<string | IncludeArgHash>

export interface IncludeArgHash {
  [key : string] : IncludeScopeArg
}

interface IncludeHash {
  [key : string] : string | IncludeHash
}

type NestedInclude = Record<string, IncludeDirective>

export interface IncludeScope {
  [key : string] : IncludeScope
}

export class IncludeDirective {
  private dct : NestedInclude = {};

  constructor(arg: IncludeScopeArg) {
    let includeHash = this._parseIncludeArgs(arg);

    for (let key in includeHash) {
      this.dct[key] = new IncludeDirective(includeHash[key]);
    }
  }

  toScopeObject() : IncludeScope {
    let hash : IncludeScope = {};
    for (let key in this.dct) {
      hash[key] = this.dct[key].toScopeObject();
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
        let split = stringValue.split(',');
        split = split.map((x) => { return `${key}.${x}` });

        stringArray.push(split.join(','));
      }
    }

    return stringArray.join(',');
  }

  private _parseIncludeArgs(includeArgs : IncludeScopeArg) : IncludeHash {
    if (Array.isArray(includeArgs)) {
      return this._parseArray(includeArgs);
    } else if (typeof includeArgs === "string") {
      let obj : IncludeHash = {};
      obj[includeArgs] = {};
      return obj;
    } else if (typeof includeArgs === "object") {
      return this._parseObject(includeArgs);
    } else {
      return {};
    }
  }

  private _parseObject(includeObj : IncludeArgHash) : IncludeHash {
    let parsed : IncludeHash = {};

    for (let key in includeObj) {
      parsed[key] = this._parseIncludeArgs(includeObj[key]);
    }
    return parsed;
  }

  private _parseArray(includeArray: Array<any>) : IncludeHash {
    let parsed : IncludeHash = {};
    for (let value of includeArray) {
      let parsedEl = this._parseIncludeArgs(value);
      for (let key in parsedEl) {
        parsed[key] = parsedEl[key];
      }
    }
    return parsed;
  }
}
