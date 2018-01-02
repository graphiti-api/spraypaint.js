export { CollectionProxy } from './collection-proxy'
export { RecordProxy } from './record-proxy'

export interface IResultProxy<T> {
  data: any
  meta: Object
  raw: JsonapiDoc
}