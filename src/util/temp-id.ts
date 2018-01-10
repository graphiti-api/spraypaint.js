let memo = 0
const generate = () : string => {
  memo++
  return `temp-id-${memo}`
}

const tempId = {
  generate
}

export { tempId, generate as generateTempId }
