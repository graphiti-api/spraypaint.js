const parameterize = (obj: any, prefix?: string): string => {
  let str = []

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      let value = obj[key]

      if (value !== undefined && value !== null && value !== "") {
        if (prefix) {
          key = `${prefix}[${key}]`
        }

        if (Array.isArray(value)) {
          value = value.map(v => {
            return maybeEncode(v)
          })
          if (value.length > 0) {
            str.push(`${key}=${value.join(",")}`)
          }
        } else if (typeof value === "object") {
          str.push(parameterize(value, key))
        } else {
          str.push(`${key}=${maybeEncode(value)}`)
        }
      }
    }
  }

  // remove blanks
  str = str.filter(p => {
    return !!p
  })

  return str.join("&")
}

// IE does not encode by default like other browsers
const maybeEncode = (value: string): string => {
  var isBrowser =
    typeof window !== "undefined" &&
    typeof window.navigator.userAgent !== "undefined"
  const isIE = isBrowser && window.navigator.userAgent.match(/(MSIE|Trident)/)
  const isEncoded = typeof value === "string" && value.indexOf("%") !== -1
  const shouldEncode = isBrowser && isIE && !isEncoded
  return shouldEncode ? encodeURIComponent(value) : value
}

export { parameterize as default }
