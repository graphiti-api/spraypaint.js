const COLORS = {
  green:   [32, 39],
  cyan:    [36, 39],
  magenta: [35, 39],
  bold:    [1,  22],
}
export type ColorKey = 'green' | 'cyan' | 'magenta' | 'bold'


export default (color : ColorKey, text : string) : string => {
  if (supportsColor()) {
    const map = COLORS[color]
    return `\u001b[${map[0]}m${text}\u001b[${map[1]}m`
  } else {
    return text
  }
}

const supportsColor = () : boolean => {
  if (typeof window === undefined) {
    if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(<any>process.env.TERM)) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}
