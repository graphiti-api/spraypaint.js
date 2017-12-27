interface JsonapiDoc {
  data: Array<JsonapiResource> | JsonapiResource
  included?: Array<JsonapiResource>;
  meta?: Object;
}

interface JsonapiResourceIdentifier {
  id: string;
  type: string;
}

interface JsonapiResource extends JsonapiResourceIdentifier {
  attributes?: Object;
  relationships?: Object;
  meta?: Object;
  links?: Object;
}

// interface IResultProxy<T> {
//   data: any
//   meta: Object
//   raw: JsonapiDoc
// }
