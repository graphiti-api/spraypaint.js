export type BeforeFilter = (requestUrl: string, options: RequestInit) => void
export type AfterFilter = (
  response: Response,
  json: JSON,
  requestOptions: RequestInit
) => void

async function asyncForEach(array: Array<Function>, callback: Function) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array)
  }
}

export class MiddlewareStack {
  private _beforeFilters: BeforeFilter[] = []
  private _afterFilters: AfterFilter[] = []
  public newResponse: Response | null = null

  constructor(before: BeforeFilter[] = [], after: AfterFilter[] = []) {
    this._beforeFilters = before
    this._afterFilters = after
    this.newResponse = null
  }

  get beforeFilters() {
    return this._beforeFilters
  }

  get afterFilters() {
    return this._afterFilters
  }

  async beforeFetch(requestUrl: string, options: RequestInit) {
    await asyncForEach(this._beforeFilters, async (filter: Function) => {
      await filter(requestUrl, options)
    })
  }

  async afterFetch(
    response: Response,
    json: JSON,
    requestOptions: RequestInit
  ) {
    await asyncForEach(this._afterFilters, async (filter: Function) => {
      await filter(response, json, requestOptions)
    })
  }
}
