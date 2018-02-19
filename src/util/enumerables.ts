export function flipEnumerable(instance: any, props: string[], to: boolean) : void {
  props.forEach((propName) => {
    let descriptor = Object.getOwnPropertyDescriptor(instance, propName)
    if (descriptor) {
      descriptor.enumerable = to
      Object.defineProperty(instance, propName, descriptor)
    }
  })
}

export function getNonEnumerables(instance: any) : string[] {
  let nonEnums = [] as string[]
  Object.getOwnPropertyNames(instance).forEach((propName) => {
    let descriptor = Object.getOwnPropertyDescriptor(instance, propName)
    if (descriptor && !descriptor.enumerable) {
      nonEnums.push(propName)
    }
  })
  return nonEnums
}