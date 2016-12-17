declare var expect: any;
declare var asyncAssert: any;

// todo deglobalize?, split test

interface japiDocArray {
  data: Array<japiResource>;
}

interface japiDoc {
  data: japiResource;
}

interface japiResource {
  id: string;
  type: string;
}
