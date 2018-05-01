import { Omit } from "./util/omit"
import { JSORMBase, ModelRecord } from "./model"

export interface IValidationError<T extends JSORMBase> {
  code: string
  attribute: keyof ValidationErrors<T>
  title: string
  message: string
  fullMessage: string
  rawPayload: Record<string, any>
}

export class ValidationError<T extends JSORMBase>
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

export type ValidationErrors<T extends JSORMBase> = ErrorAttrs<
  T,
  keyof (Omit<T, keyof JSORMBase>)
>
export type ErrorAttrs<T extends JSORMBase, K extends keyof T> = {
  [P in K]?: IValidationError<T> | undefined
} & {
  base?: IValidationError<T>
  /*
   * Index is necessary for typescript 2.8 compatibility. If we don't have
   * this, the `@Model()` decorator doesn't work.  The error is that subclasses
   * of JSORMBase with additional fields aren't compabible since their error
   * objects aren't compatible. This is because ErrorAttrs<JSORMBase> doesn't
   * have a key like e.g. "title", whereas ErrorAttrs<Post> will. Adding an
   * index allowing undefined values will make these compatbile.
   */
  [key: string] : IValidationError<T> | undefined
}

let f = new JSORMBase()
