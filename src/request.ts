import Config from './configuration';
import colorize from './util/colorize';

export default class Request {
  get(url : string) : Promise<japiDoc> {
    Config.logger.info(colorize('cyan', 'GET: ') + colorize('magenta', url));

    return new Promise((resolve, reject) => {
      fetch(url).then((response) => {
        response.json().then((json) => {
          Config.logger.debug(colorize('bold', JSON.stringify(json, null, 4)));
          resolve(json);
        });
      });
    });
  }
}
