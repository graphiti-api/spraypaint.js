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

export default class Logger {
  private _level : LogLevel = LogLevel.info;

  get level() {
    let key : LogLevelKey

    for (key in LogLevel) {
      let val = LogLevel[key as LogLevelKey];
      if (val === this._level) {
        return key
      }
    }
  }

  set level(value : LogLevelKey) {
    let lvlValue = LogLevel[value];

    if (lvlValue) {
      this._level = lvlValue;
    } else {
      throw(`Log level must be one of ${Object.keys(LOG_LEVELS).join(', ')}`)
    }
  }

  debug(stmt : any) {
    if (this._level <= LogLevel.debug) {
      console.info(stmt);
    }
  }

  info(stmt : any) {
    if (this._level <= LogLevel.info) {
      console.info(stmt);
    }
  }

  warn(stmt : any) {
    if (this._level <= LogLevel.warn) {
      console.warn(stmt);
    }
  }

  error(stmt : any) {
    if (this._level <= LogLevel.warn) {
      console.error(stmt);
    }
  }
}


