// todo deglobalize?, split test

declare module NodeJS  {
  interface Global {
    __extends: Function;
  }
}

interface japiDoc {
  data: any; // can't do Array | japiResource
  included?: Array<japiResource>;
  meta?: any;
}

interface japiResourceIdentifier {
  id: string;
  type: string;
}

interface japiResource extends japiResourceIdentifier {
  attributes?: Object;
  relationships?: Object;
  meta?: Object;
  links?: Object;
}

interface IResultProxy<T> {
  data: any
  meta: Object
  raw: japiDoc
}
