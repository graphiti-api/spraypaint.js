const parameterize = (obj : any, prefix? : string) : string => {
  let str = []

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]

      if (value !== undefined && value !== null && value !== '') {
        if (prefix) {
          key = `${prefix}[${key}]`
        }

        if (Array.isArray(value)) {
          if (value.length > 0) {
            str.push(`${key}=${value.join(',')}`)
          }
        } else if (typeof value === "object") {
          str.push(parameterize(value, key))
        } else {
          str.push(`${key}=${value}`)
        }
      }
    }
  }

  // remove blanks
  str = str.filter((p) => {
    return !!p
  })

  return str.join("&")
}

export { parameterize as default }