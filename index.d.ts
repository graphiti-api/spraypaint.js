declare var expect: any;
declare var asyncAssert: any;

// todo deglobalize?, split test

declare module NodeJS  {
  interface Global {
    __extends: Function;
    sinon: any;
    JSORM: any;
  }
}

interface IModel {
  id: string;
  [propName: string]: any;
}

interface anyObject {
  [propName: string]: any;
}

interface modelsConfig {
  [key: string]: any;
}

interface japiDocArray {
  data: Array<japiResource>;
}

interface japiDoc {
  data: japiResource;
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
