import colorize from './util/colorize';
import { MiddlewareStack } from './middleware-stack';
import { ILogger, logger as defaultLogger } from './logger';

export type RequestVerbs = keyof Request

export class Request {
  middleware: MiddlewareStack
  private logger : ILogger

  constructor(middleware: MiddlewareStack, logger : ILogger) {
    this.middleware = middleware
    this.logger = logger
  }

  get(url : string, options: RequestInit) : Promise<any> {
    options.method = 'GET';
    return this._fetchWithLogging(url, options);
  }

  post(url: string, payload: Object, options: RequestInit) : Promise<any> {
    options.method = 'POST';
    options.body   = JSON.stringify(payload);

    return this._fetchWithLogging(url, options);
  }

  put(url: string, payload: Object, options: RequestInit) : Promise<any> {
    options.method = 'PUT';
    options.body   = JSON.stringify(payload);

    return this._fetchWithLogging(url, options);
  }

  delete(url: string, options: RequestInit) : Promise<any> {
    options.method = 'DELETE';
    return this._fetchWithLogging(url, options);
  }

  // private

  private _logRequest(verb: string, url: string) : void {
    this.logger.info(colorize('cyan', `${verb}: `) + colorize('magenta', url));
  }

  private _logResponse(responseJSON : string) : void {
    this.logger.debug(colorize('bold', JSON.stringify(responseJSON, null, 4)));
  }

  private async _fetchWithLogging(url: string, options: RequestInit) : Promise<any> {
    this._logRequest(options.method || 'UNDEFINED METHOD', url);

    let response = await this._fetch(url, options);

    this._logResponse(response['jsonPayload']);

    return response
  }

  private async _fetch(url: string, options: RequestInit) : Promise<any> {
    try {
      this.middleware.beforeFetch(url, options)
    } catch(e) {
      throw new RequestError('beforeFetch failed; review middleware.beforeFetch stack', url, options, e)
    }

    let response

    try {
      response = await fetch(url, options)
    } catch (e) {
      throw new ResponseError(null, e.message, e)
    }

    await this._handleResponse(response)

    return response
  }

  private async _handleResponse(response: Response) {
    let json
    try {
      json = await response.json()
    } catch(e) {
      throw new ResponseError(response, 'invalid json', e)
    }

    try {
      this.middleware.afterFetch(response, json)
    } catch(e) {
      // afterFetch middleware failed
      throw new ResponseError(response, 'afterFetch failed; review middleware.afterFetch stack', e)
    }

    if (response.status >= 500) {
      throw new ResponseError(response, 'Server Error')
    } else if (response.status !== 422 && json['data'] === undefined) {
      // Bad JSON, for instance an errors payload
      // Allow 422 since we specially handle validation errors
      throw new ResponseError(response, 'invalid json')
    }

    ;(<any>response)['jsonPayload'] = json;
  }
}

class RequestError extends Error {
  url: string
  options: RequestInit
  originalError: Error

  constructor(message: string, url: string, options: RequestInit, originalError: Error) {
    super(message)
    this.stack = originalError.stack
    this.url = url
    this.options = options
    this.originalError = originalError
  }
}

class ResponseError extends Error {
  response: Response | null
  originalError: Error | undefined

  constructor(response: Response | null, message?: string, originalError?: Error) {
    super(message || 'Invalid Response')
    this.response = response
    this.originalError = originalError
  }
}