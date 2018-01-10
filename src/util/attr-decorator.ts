export default function(decorator: Function) : Function {
  return function(target: any, attrName: string, descriptor: PropertyDescriptor) : void {
    if (!target['__attrDecorators']) target['__attrDecorators'] = []
    target['__attrDecorators'].push({ attrName, decorator })
  }
}
