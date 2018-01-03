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

export class Logger {
  private _level : LogLevel = LogLevel.info

  constructor(level : LogLevelKey | LogLevel = 'warn') {
    if (typeof level === 'number') {
      this._level = level
    } else {
      this.setLevel(level)
    }
  }

  debug(stmt : any) : void {
    if (this._level <= LogLevel.debug) {
      console.info(stmt);
    }
  }

  info(stmt : any) : void {
    if (this._level <= LogLevel.info) {
      console.info(stmt);
    }
  }

  warn(stmt : any) : void {
    if (this._level <= LogLevel.warn) {
      console.warn(stmt);
    }
  }

  error(stmt : any) : void {
    if (this._level <= LogLevel.warn) {
      console.error(stmt);
    }
  }

  setLevel(value : LogLevelKey) {
    let lvlValue = LogLevel[value];

    if (lvlValue) {
      this._level = lvlValue;
    } else {
      throw(`Log level must be one of ${Object.keys(LOG_LEVELS).join(', ')}`)
    }
  }

  level() {
    let key : LogLevelKey

    for (key in LogLevel) {
      let val = LogLevel[key as LogLevelKey];
      if (val === this._level) {
        return key
      }
    }
  }
}

export const logger = new Logger()
