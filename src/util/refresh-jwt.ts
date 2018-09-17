import { SpraypaintBase } from "../model"

export const refreshJWT = (
  klass: typeof SpraypaintBase,
  serverResponse: Response
): void => {
  const jwt = serverResponse.headers.get("X-JWT")

  if (jwt) {
    klass.setJWT(jwt)
  }
}
