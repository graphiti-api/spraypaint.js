interface JsonapiDoc {
  data: Array<JsonapiResource> | JsonapiResource
  included?: Array<JsonapiResource>;
  meta?: object;
}

interface JsonapiResourceIdentifier {
  id? : string;
  temp_id? : string
  'temp-id'? : string;
  type : string;
}

interface JsonapiResource extends JsonapiResourceIdentifier {
  attributes?: object;
  relationships?: object;
  meta?: object;
  links?: object;
}

// interface IResultProxy<T> {
//   data: any
//   meta: Object
//   raw: JsonapiDoc
// }
