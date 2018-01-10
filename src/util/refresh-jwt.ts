import { JSORMBase } from '../model'

export const refreshJWT = (klass : typeof JSORMBase, serverResponse : Response) : void => {
  let jwt = serverResponse.headers.get('X-JWT')

  if (jwt) {
    klass.setJWT(jwt)
  }
}
