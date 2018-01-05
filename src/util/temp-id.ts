let memo = 0
const generate = function() : string {
  memo++
  return `temp-id-${memo}`
}

const tempId = {
  generate
}

export { tempId, generate as generateTempId }
