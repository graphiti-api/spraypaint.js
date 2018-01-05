type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T];  
type Omit<T, K extends keyof T> = {[P in Diff<keyof T, K>]: T[P]};  

type JsonapiResponseDoc = JsonapiCollectionDoc | JsonapiResourceDoc | JsonapiErrorDoc
type JsonapiRequestDoc  = JsonapiResourceRequest

interface JsonapiDocMeta {
  included?: Array<JsonapiResource>;
  meta?: object;
}

interface JsonapiCollectionDoc extends JsonapiDocMeta {
  data: Array<JsonapiResource>
  errors?: undefined
}

interface JsonapiResourceDoc extends JsonapiDocMeta {
  data?: JsonapiResource | undefined
  errors?: undefined
}

interface JsonapiResourceRequest extends JsonapiDocMeta {
  data: JsonapiResource
}

interface JsonapiErrorDoc extends JsonapiDocMeta {
  data: undefined
  errors: Array<JsonapiError>
}

interface JsonapiResourceIdentifier {
  type : string
  id? : string;
  temp_id? : string
  'temp-id'? : string
  method? : JsonapiResourceMethod
}

type JsonapiResourceMethod = 'create' | 'update' | 'destroy' | 'disassociate'

interface JsonapiResource extends JsonapiResourceIdentifier {
  attributes?: object;
  relationships?: object;
  meta?: object;
  links?: object;
}

interface JsonapiError {
  id?: string
  status?: string
  code?: string
  title?: string
  detail?: string
  source?: JsonapiErrorSource 
  meta: JsonapiErrorMeta
}

interface JsonapiErrorSource {
  pointer?: string,
  parameter?: string,
}

type JsonapiErrorMeta = Record<string, any>