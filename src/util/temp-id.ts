let memo = 0
const generate = function() : string {
  memo++
  return `temp-id-${memo}`
}

export default { generate }
