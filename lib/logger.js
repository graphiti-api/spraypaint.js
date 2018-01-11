"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-console */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["debug"] = 1] = "debug";
    LogLevel[LogLevel["info"] = 2] = "info";
    LogLevel[LogLevel["warn"] = 3] = "warn";
    LogLevel[LogLevel["error"] = 4] = "error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var LOG_LEVELS = {
    debug: 1,
    info: 2,
    warn: 3,
    error: 4
};
var Logger = /** @class */ (function () {
    function Logger(level) {
        if (level === void 0) { level = "warn"; }
        this._level = LogLevel.info;
        if (typeof level === "number") {
            this._level = level;
        }
        else {
            this.level = level;
        }
    }
    Logger.prototype.debug = function (stmt) {
        if (this._level <= LogLevel.debug) {
            console.info(stmt);
        }
    };
    Logger.prototype.info = function (stmt) {
        if (this._level <= LogLevel.info) {
            console.info(stmt);
        }
    };
    Logger.prototype.warn = function (stmt) {
        if (this._level <= LogLevel.warn) {
            console.warn(stmt);
        }
    };
    Logger.prototype.error = function (stmt) {
        if (this._level <= LogLevel.warn) {
            console.error(stmt);
        }
    };
    Object.defineProperty(Logger.prototype, "level", {
        get: function () {
            var key;
            for (key in LogLevel) {
                if (LogLevel.hasOwnProperty(key)) {
                    var val = LogLevel[key];
                    if (val === this._level) {
                        return key;
                    }
                }
            }
            throw new Error("Invalid log level: " + this._level);
        },
        set: function (value) {
            var lvlValue = LogLevel[value];
            if (lvlValue) {
                this._level = lvlValue;
            }
            else {
                throw new Error("Log level must be one of " + Object.keys(LOG_LEVELS).join(", "));
            }
        },
        enumerable: true,
        configurable: true
    });
    return Logger;
}());
exports.Logger = Logger;
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map