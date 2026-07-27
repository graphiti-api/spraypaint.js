import colorize from "./util/colorize"
import { MiddlewareStack } from "./middleware-stack"
import { ILogger, logger as defaultLogger } from "./logger"
import { JsonapiResponseDoc, JsonapiRequestDoc } from "./jsonapi-spec"

export type RequestVerbs = keyof Request

export interface JsonapiResponse extends Response {
  jsonPayload: JsonapiResponseDoc
}

export interface RequestConfig {
  patchAsPost: boolean
}

export class Request {
  middleware: MiddlewareStack
  config: RequestConfig
  private logger: ILogger

  constructor(
    middleware: MiddlewareStack,
    logger: ILogger,
    config?: RequestConfig
  ) {
    this.middleware = middleware
    this.logger = logger
    this.config = Object.assign({ patchAsPost: false }, config)
  }

  get(url: string, options: RequestInit): Promise<any> {
    options.method = "GET"
    return this._fetchWithLogging(url, options)
  }

  post(
    url: string,
    payload: JsonapiRequestDoc,
    options: RequestInit
  ): Promise<any> {
    options.method = "POST"
    options.body = JSON.stringify(payload)

    return this._fetchWithLogging(url, options)
  }

  patch(
    url: string,
    payload: JsonapiRequestDoc,
    options: RequestInit
  ): Promise<any> {
    if (this.config.patchAsPost) {
      options.method = "POST"
      if (!options.headers) options.headers = {}
      options.headers["X-HTTP-Method-Override"] = "PATCH"
    } else {
      options.method = "PATCH"
    }
    options.body = JSON.stringify(payload)

    return this._fetchWithLogging(url, options)
  }

  delete(url: string, options: RequestInit): Promise<any> {
    options.method = "DELETE"
    return this._fetchWithLogging(url, options)
  }

  // private

  private _logRequest(verb: string, url: string): void {
    this.logger.info(colorize("cyan", `${verb}: `) + colorize("magenta", url))
  }

  private _logResponse(responseJSON: string): void {
    this.logger.debug(colorize("bold", JSON.stringify(responseJSON, null, 4)))
  }

  private async _fetchWithLogging(
    url: string,
    options: RequestInit
  ): Promise<any> {
    this._logRequest(options.method || "UNDEFINED METHOD", url)

    const response = await this._fetch(url, options)

    this._logResponse(response.jsonPayload)

    return response
  }

  private async _fetch(url: string, options: RequestInit): Promise<any> {
    try {
      await this.middleware.beforeFetch(url, options)
    } catch (e) {
      throw new RequestError(
        "beforeFetch failed; review middleware.beforeFetch stack",
        url,
        options,
        e
      )
    }

    let response

    try {
      response = await fetch(url, options)
    } catch (e) {
      throw new ResponseError(null, e.message, e)
    }

    const middlewareResponse = await this._handleResponse(response, options)

    return middlewareResponse || response
  }

  private async _handleResponse(
    response: Response,
    requestOptions: RequestInit
  ) {
    const wasDelete =
      requestOptions.method === "DELETE" &&
      [204, 200].indexOf(response.status) > -1
    if (wasDelete) return

    let json
    try {
      json = await response.clone().json()
    } catch (e) {
      const isEmptyResponse = [202, 204].indexOf(response.status) > -1
      if (isEmptyResponse) return
      throw new ResponseError(response, "invalid json", e)
    }

    try {
      await this.middleware.afterFetch(response, json, requestOptions)

      if (this.middleware.newResponse) {
        response = this.middleware.newResponse.clone()
        json = await response.json()
        this.middleware.newResponse = null
      }
    } catch (e) {
      // afterFetch middleware failed
      throw new ResponseError(
        response,
        "afterFetch failed; review middleware.afterFetch stack",
        e
      )
    }

    if (response.status >= 500) {
      throw new ResponseError(response, "Server Error")
      // Allow 422 since we specially handle validation errors
    } else if (response.status !== 422 && json.data === undefined) {
      if (response.status === 404) {
        throw new ResponseError(response, "record not found")
      } else {
        // Bad JSON, for instance an errors payload
        throw new ResponseError(response, "invalid json")
      }
    }

    ;(<any>response).jsonPayload = json

    return response
  }
}

class RequestError extends Error {
  url: string
  options: RequestInit
  originalError: Error

  constructor(
    message: string,
    url: string,
    options: RequestInit,
    originalError: Error
  ) {
    super(message)
    this.stack = originalError.stack
    this.url = url
    this.options = options
    this.originalError = originalError
  }
}

export class ResponseError extends Error {
  response: Response | null
  originalError: Error | undefined

  constructor(
    response: Response | null,
    message?: string,
    originalError?: Error
  ) {
    super(message || "Invalid Response")
    this.response = response
    this.originalError = originalError
  }
}
