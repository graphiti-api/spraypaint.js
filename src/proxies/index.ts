export { CollectionProxy } from './collection-proxy'
export { RecordProxy } from './record-proxy'

export interface IResultProxy<T> {
  data: T | T[] | null
  meta: Object
  raw: JsonapiDoc
}