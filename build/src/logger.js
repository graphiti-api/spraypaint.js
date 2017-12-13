"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    error: 4,
};
var Logger = /** @class */ (function () {
    function Logger() {
        this._level = LogLevel.info;
    }
    Object.defineProperty(Logger.prototype, "level", {
        get: function () {
            var key;
            for (key in LogLevel) {
                var val = LogLevel[key];
                if (val === this._level) {
                    return key;
                }
            }
        },
        set: function (value) {
            var lvlValue = LogLevel[value];
            if (lvlValue) {
                this._level = lvlValue;
            }
            else {
                throw ("Log level must be one of " + Object.keys(LOG_LEVELS).join(', '));
            }
        },
        enumerable: true,
        configurable: true
    });
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
    return Logger;
}());
exports.default = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQVksUUFLWDtBQUxELFdBQVksUUFBUTtJQUNsQix5Q0FBUyxDQUFBO0lBQ1QsdUNBQVEsQ0FBQTtJQUNSLHVDQUFRLENBQUE7SUFDUix5Q0FBUyxDQUFBO0FBQ1gsQ0FBQyxFQUxXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBS25CO0FBR0QsSUFBTSxVQUFVLEdBQUc7SUFDakIsS0FBSyxFQUFFLENBQUM7SUFDUixJQUFJLEVBQUUsQ0FBQztJQUNQLElBQUksRUFBRSxDQUFDO0lBQ1AsS0FBSyxFQUFFLENBQUM7Q0FDVCxDQUFBO0FBRUQ7SUFBQTtRQUNVLFdBQU0sR0FBYyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBOEM1QyxDQUFDO0lBNUNDLHNCQUFJLHlCQUFLO2FBQVQ7WUFDRSxJQUFJLEdBQWlCLENBQUE7WUFFckIsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFrQixDQUFDLENBQUM7Z0JBQ3ZDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDeEIsTUFBTSxDQUFDLEdBQUcsQ0FBQTtnQkFDWixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7YUFFRCxVQUFVLEtBQW1CO1lBQzNCLElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUUvQixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNiLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO1lBQ3pCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixNQUFLLENBQUMsOEJBQTRCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRyxDQUFDLENBQUE7WUFDekUsQ0FBQztRQUNILENBQUM7OztPQVZBO0lBWUQsc0JBQUssR0FBTCxVQUFNLElBQVU7UUFDZCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsQ0FBQztJQUNILENBQUM7SUFFRCxxQkFBSSxHQUFKLFVBQUssSUFBVTtRQUNiLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQixDQUFDO0lBQ0gsQ0FBQztJQUVELHFCQUFJLEdBQUosVUFBSyxJQUFVO1FBQ2IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JCLENBQUM7SUFDSCxDQUFDO0lBRUQsc0JBQUssR0FBTCxVQUFNLElBQVU7UUFDZCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEIsQ0FBQztJQUNILENBQUM7SUFDSCxhQUFDO0FBQUQsQ0FBQyxBQS9DRCxJQStDQyJ9