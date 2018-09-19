import { Omit } from "./util/omit"
import { SpraypaintBase, ModelRecord } from "./model"

export interface IValidationError<T extends SpraypaintBase> {
  code: string
  attribute: keyof ValidationErrors<T>
  title: string
  message: string
  fullMessage: string
  rawPayload: Record<string, any>
}

export class ValidationError<T extends SpraypaintBase>
  implements IValidationError<T> {
  code!: string
  attribute!: keyof ValidationErrors<T>
  title!: string
  message!: string
  fullMessage!: string
  rawPayload!: Record<string, any>

  constructor(options: IValidationError<T>) {
    let key: keyof IValidationError<T>

    for (key in options) {
      this[key] = options[key]
    }
  }
}

export type ValidationErrors<T extends SpraypaintBase> = ErrorAttrs<
  T,
  keyof (Omit<T, keyof SpraypaintBase>)
>
export type ErrorAttrs<T extends SpraypaintBase, K extends keyof T> = {
  [P in K]?: IValidationError<T> | undefined
} & {
  base?: IValidationError<T>
  /*
   * Index is necessary for typescript 2.8 compatibility. If we don't have
   * this, the `@Model()` decorator doesn't work.  The error is that subclasses
   * of SpraypaintBase with additional fields aren't compabible since their error
   * objects aren't compatible. This is because ErrorAttrs<SpraypaintBase> doesn't
   * have a key like e.g. "title", whereas ErrorAttrs<Post> will. Adding an
   * index allowing undefined values will make these compatbile.
   */
  [key: string] : IValidationError<T> | undefined
}