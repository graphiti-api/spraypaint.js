import Config from './configuration';
import colorize from './util/colorize';

export default class Request {
  get(url : string, options: Object) : Promise<any> {
    options['method'] = 'GET';
    return this._fetchWithLogging(url, options);
  }

  post(url: string, payload: Object, options: Object) : Promise<any> {
    options['method'] = 'POST';
    options['body']   = JSON.stringify(payload);

    return this._fetchWithLogging(url, options);
  }

  put(url: string, payload: Object, options: Object) : Promise<any> {
    options['method'] = 'PUT';
    options['body']   = JSON.stringify(payload);

    return this._fetchWithLogging(url, options);
  }

  delete(url: string, options: Object) : Promise<any> {
    options['method'] = 'DELETE';
    return this._fetchWithLogging(url, options);
  }

  // private

  private _logRequest(verb: string, url: string) : void {
    Config.logger.info(colorize('cyan', `${verb}: `) + colorize('magenta', url));
  }

  private _logResponse(responseJSON : string) : void {
    Config.logger.debug(colorize('bold', JSON.stringify(responseJSON, null, 4)));
  }

  private _fetchWithLogging(url: string, options: Object) : Promise<any> {
    this._logRequest(options['method'], url);
    let promise = this._fetch(url, options);
    promise.then((response : any) => {
      this._logResponse(response['jsonPayload']);
    });
    return promise;
  }

  private _fetch(url: string, options: Object) : Promise<any> {
    return new Promise((resolve, reject) => {
      let headers = this.buildHeaders(options);
      options['headers'] = headers;

      let fetchPromise = fetch(url, options);
      fetchPromise.then((response) => {
        response.json().then((json) => {
          response['jsonPayload'] = json;
          resolve(response);
        }).catch((e) => { throw(e); });
      });
      fetchPromise.catch(reject);
    });
  }

  private buildHeaders(options: Object) : any {
    let headers = {};
    headers['Accept'] = 'application/json';
    headers['Content-Type'] = 'application/json';

    if (options['jwt']) {
      headers['Authorization'] = `Token token="${options['jwt']}"`;
    }

    return headers;
  }
}
