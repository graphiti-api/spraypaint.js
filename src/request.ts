import Config from './configuration';
import colorize from './util/colorize';

export default class Request {
  get(url : string, options: Object) : Promise<any> {
    Config.logger.info(colorize('cyan', 'GET: ') + colorize('magenta', url));

    return new Promise((resolve, reject) => {
      let headers = this.buildHeaders(options);

      fetch(url, { headers }).then((response) => {
        response.json().then((json) => {
          Config.logger.debug(colorize('bold', JSON.stringify(json, null, 4)));
          resolve({ json, headers: response.headers });
        });
      });
    });
  }

  private buildHeaders(options: Object) : any {
    let headers = {};

    if (options['jwt']) {
      headers['Authorization'] = `Token token="${options['jwt']}"`
    }

    return headers;
  }
}
