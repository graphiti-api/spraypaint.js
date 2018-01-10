export type BeforeFilter = (requestUrl : string, options: RequestInit) => void
export type AfterFilter = (response : Response, json: JSON) => void

export class MiddlewareStack {
  private _beforeFilters: BeforeFilter[] = []
  private _afterFilters: AfterFilter[] = []

  constructor(before: BeforeFilter[] = [], after : AfterFilter[] = []) {
    this._beforeFilters = before
    this._afterFilters = after
  }

  get beforeFilters() {
    return this._beforeFilters
  }

  get afterFilters() {
    return this._afterFilters
  }

  beforeFetch(requestUrl : string, options : RequestInit) {
    this._beforeFilters.forEach((filter) => {
      filter(requestUrl, options)
    })
  }

  afterFetch(response : Response, json: JSON) {
    this._afterFilters.forEach((filter) => {
      filter(response, json)
    })
  }
}