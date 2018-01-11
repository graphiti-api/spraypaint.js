/* tslint:disable */
export default (decorator : Function) : Function => {
  return (target : any, attrName : string, descriptor : PropertyDescriptor) : void => {
    if (!target.__attrDecorators) target.__attrDecorators = []
    target.__attrDecorators.push({ attrName, decorator })
  }
}
