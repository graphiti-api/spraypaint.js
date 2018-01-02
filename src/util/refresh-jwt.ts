import { JSORMBase } from '../model';
import Config from '../configuration';

export function refreshJWT(klass: typeof JSORMBase, serverResponse: Response) : void {
  let jwt = serverResponse.headers.get('X-JWT');
  let localStorage = Config.localStorage;

  if (localStorage) {
    let localStorageKey = Config.jwtLocalStorage;
    if (localStorageKey) {
      localStorage['setItem'](localStorageKey, jwt);
    }
  }

  if (jwt) {
    klass.setJWT(jwt);
  }
}
