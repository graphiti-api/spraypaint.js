"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var COLORS = {
    green: [32, 39],
    cyan: [36, 39],
    magenta: [35, 39],
    bold: [1, 22]
};
exports.default = function (color, text) {
    if (supportsColor()) {
        var map = COLORS[color];
        return "\u001B[" + map[0] + "m" + text + "\u001B[" + map[1] + "m";
    }
    else {
        return text;
    }
};
var supportsColor = function () {
    if (typeof window === undefined) {
        if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env
            .TERM)) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
};
//# sourceMappingURL=colorize.js.map