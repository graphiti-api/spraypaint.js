export type JsonapiResponseDoc =
  | JsonapiCollectionDoc
  | JsonapiResourceDoc
  | JsonapiErrorDoc
export type JsonapiSuccessDoc = JsonapiCollectionDoc | JsonapiResourceDoc
export type JsonapiRequestDoc = JsonapiResourceRequest
export type JsonapiBulkRequestDoc = JsonapiResourceBulkRequest

export interface JsonapiDocMeta {
  included?: JsonapiResource[]
  meta?: Record<string, any>
}

export interface JsonapiCollectionDoc extends JsonapiDocMeta {
  data: JsonapiResource[]
  errors?: undefined
}

export interface JsonapiResourceDoc extends JsonapiDocMeta {
  data: JsonapiResource
  errors?: undefined
}

export interface JsonapiResourceRequest extends JsonapiDocMeta {
  data: JsonapiResource
}

export interface JsonapiResourceBulkRequest extends JsonapiDocMeta {
  data: JsonapiResource[]
}

export interface JsonapiErrorDoc extends JsonapiDocMeta {
  data: undefined
  errors: JsonapiError[]
}

export interface JsonapiResourceIdentifier {
  type: string
  id?: string
  temp_id?: string
  "temp-id"?: string
  method?: JsonapiResourceMethod
}

export type JsonapiResourceMethod =
  | "create"
  | "update"
  | "destroy"
  | "disassociate"

export interface JsonapiResource extends JsonapiResourceIdentifier {
  attributes?: object
  relationships?: object
  meta?: Record<string, any>
  links?: object
}

export interface JsonapiError {
  id?: string
  status?: string
  code?: string
  title?: string
  detail?: string
  source?: JsonapiErrorSource
  meta: JsonapiErrorMeta
}

export interface JsonapiErrorSource {
  pointer?: string
  parameter?: string
}

export type JsonapiErrorMeta = Record<string, any>
