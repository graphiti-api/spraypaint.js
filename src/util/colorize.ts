const COLORS = {
  green:   [32, 39],
  cyan:    [36, 39],
  magenta: [35, 39],
  bold:    [1,  22],
}

export default function colorize(color : string, text: string) : string {
  if (supportsColor()) {
    let map = COLORS[color];
    return `\u001b[${map[0]}m${text}\u001b[${map[1]}m`;
  } else {
    return text;
  }
}

function supportsColor() : boolean {
  if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
    return true;
  } else {
    return false
  }
}


