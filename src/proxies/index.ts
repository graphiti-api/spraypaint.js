export { CollectionProxy } from "./collection-proxy"
export { RecordProxy } from "./record-proxy"
export { NullProxy } from "./null-proxy"
import { PersistedSpraypaintRecord, SpraypaintBase } from "../model"
import { JsonapiResponseDoc } from "../jsonapi-spec"

export interface IResultProxy<T extends SpraypaintBase> {
  data: PersistedSpraypaintRecord<T> | PersistedSpraypaintRecord<T>[] | null
  meta: Record<string, any>
  raw: JsonapiResponseDoc
}
