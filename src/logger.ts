export enum LogLevel {
  debug = 1,
  info = 2,
  warn = 3,
  error = 4,
}
export type LogLevelKey = keyof(typeof LogLevel)

const LOG_LEVELS = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
}

export interface ILogger {
  debug(stmt : any) : void
  info(stmt : any) : void
  warn(stmt : any) : void
  error(stmt : any) : void
  level : string
}

export class Logger implements ILogger {
  private _level : LogLevel = LogLevel.info

  constructor(level : LogLevelKey | LogLevel = 'warn') {
    if (typeof level === 'number') {
      this._level = level
    } else {
      this.level =level
    }
  }

  debug(stmt : any) : void {
    if (this._level <= LogLevel.debug) {
      console.info(stmt)
    }
  }

  info(stmt : any) : void {
    if (this._level <= LogLevel.info) {
      console.info(stmt)
    }
  }

  warn(stmt : any) : void {
    if (this._level <= LogLevel.warn) {
      console.warn(stmt)
    }
  }

  error(stmt : any) : void {
    if (this._level <= LogLevel.warn) {
      console.error(stmt)
    }
  }

  set level(value : string) {
    let lvlValue = LogLevel[value as LogLevelKey]

    if (lvlValue) {
      this._level = lvlValue
    } else {
      throw(`Log level must be one of ${Object.keys(LOG_LEVELS).join(', ')}`)
    }
  }

  get level() : string{
    let key : LogLevelKey

    for (key in LogLevel) {
      let val = LogLevel[key as LogLevelKey]
      if (val === this._level) {
        return key
      }
    }
    
    throw new Error(`Invalid log level: ${this._level}`)
  }
}

export const logger = new Logger()
