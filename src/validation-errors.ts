import { SpraypaintBase } from "./model"

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
    for (const key in options) {
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
}
