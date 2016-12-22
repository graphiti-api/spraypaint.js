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

interface japiDoc {
  data: any; // can't do Array | japiResource
  included: Array<japiResource>;
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
