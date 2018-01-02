type JsonapiDoc = JsonapiCollectionDoc | JsonapiResourceDoc

interface JsonapiDocMeta {
  included?: Array<JsonapiResource>;
  meta?: object;
}

interface JsonapiCollectionDoc extends JsonapiDocMeta {
  data: Array<JsonapiResource>
}

interface JsonapiResourceDoc extends JsonapiDocMeta {
  data?: JsonapiResource | null
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
