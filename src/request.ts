import Config from './configuration';
import colorize from './util/colorize';
import { MiddlewareStack } from './middleware-stack';

export type RequestVerbs = keyof Request

export class Request {
  middleware: MiddlewareStack

  constructor(middleware: MiddlewareStack) {
    this.middleware = middleware
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
    Config.logger.info(colorize('cyan', `${verb}: `) + colorize('magenta', url));
  }

  private _logResponse(responseJSON : string) : void {
    Config.logger.debug(colorize('bold', JSON.stringify(responseJSON, null, 4)));
  }

  private _fetchWithLogging(url: string, options: RequestInit) : Promise<any> {
    this._logRequest(options.method || 'UNDEFINED METHOD', url);
    let promise = this._fetch(url, options);
    return promise.then((response : any) => {
      this._logResponse(response['jsonPayload']);
      return response
    });
  }

  private _fetch(url: string, options: RequestInit) : Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.middleware.beforeFetch(url, options)
      } catch(e) {
        reject(new RequestError('beforeFetch failed; review middleware.beforeFetch stack', url, options, e))
      }

      let fetchPromise = fetch(url, options);
      fetchPromise.then(async (response) => {
        this._handleResponse(response, resolve, reject)
      });

      fetchPromise.catch((e) => {
        // Fetch itself failed (usually network error)
        reject(new ResponseError(null, e.message, e))
      })
    });
  }

  private _handleResponse(response: Response, resolve: Function, reject: Function) : void {
    response.json().then((json) => {
      try {
        this.middleware.afterFetch(response, json)
      } catch(e) {
        // afterFetch middleware failed
        reject(new ResponseError(response, 'afterFetch failed; review middleware.afterFetch stack', e))
      }

      if (response.status >= 500) {
        reject(new ResponseError(response, 'Server Error'))
      } else if (response.status !== 422 && json['data'] === undefined) {
        // Bad JSON, for instance an errors payload
        // Allow 422 since we specially handle validation errors
        reject(new ResponseError(response, 'invalid json'))
      }

      ;(<any>response)['jsonPayload'] = json;
      resolve(response);
    }).catch((e) => {
      // The response was probably not in JSON format
      reject(new ResponseError(response, 'invalid json', e))
    });
  }
}

class RequestError extends Error {
  url: string
  options: RequestInit
  originalError: Error

  constructor(message: string, url: string, options: RequestInit, originalError: Error) {
    super(message)
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