export default class Logger {
  private _level = 2;
  private LEVELS = {
    debug: 1,
    info:  2,
    warn:  3,
    error: 4
  }

  get level() {
    for (let key in this.LEVELS) {
      let val = this.LEVELS[key];
      if (val === this._level) return key;
    }
  }

  set level(value : string) {
    let lvlValue = this.LEVELS[value];

    if (lvlValue) {
      this._level = lvlValue;
    } else {
      throw(`Log level must be one of ${Object.keys(this.LEVELS).join(', ')}`)
    }
  }

  debug(stmt) {
    if (this._level <= this.LEVELS.debug) {
      console.debug(stmt);
    }
  }

  info(stmt) {
    if (this._level <= this.LEVELS.info) {
      console.info(stmt);
    }
  }

  warn(stmt) {
    if (this._level <= this.LEVELS.warn) {
      console.warn(stmt);
    }
  }

  error(stmt) {
    if (this._level <= this.LEVELS.warn) {
      console.error(stmt);
    }
  }
}
