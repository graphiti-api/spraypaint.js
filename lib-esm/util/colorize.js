var COLORS = {
    green: [32, 39],
    cyan: [36, 39],
    magenta: [35, 39],
    bold: [1, 22],
};
export default function colorize(color, text) {
    if (supportsColor()) {
        var map = COLORS[color];
        return "\u001B[" + map[0] + "m" + text + "\u001B[" + map[1] + "m";
    }
    else {
        return text;
    }
}
function supportsColor() {
    if (typeof window === undefined) {
        if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}
//# sourceMappingURL=colorize.js.map