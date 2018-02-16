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
  code: string
  attribute: keyof ValidationErrors<T>
  title: string
  message: string
  fullMessage: string
  rawPayload: Record<string, any>

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
  [P in K]?: ValidationError<T>
} & { base?: ValidationError<T> }

let f = new JSORMBase()
