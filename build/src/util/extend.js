"use strict";
/// <reference path="../../types/index.d.ts" />
// use for non-typescript extends
Object.defineProperty(exports, "__esModule", { value: true });
var globalObj;
if (typeof window === 'undefined') {
    globalObj = global;
}
else {
    globalObj = window;
}
function default_1(superclass, classObj) {
    globalObj['__extends'](Model, superclass);
    function Model() {
        var _this = superclass.apply(this, arguments) || this;
        for (var prop in classObj) {
            if (prop !== 'static' && classObj.hasOwnProperty(prop)) {
                _this[prop] = classObj[prop];
            }
        }
        return _this;
    }
    for (var classProp in classObj.static) {
        Model[classProp] = classObj.static[classProp];
    }
    superclass.inherited(Model);
    return Model;
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWwvZXh0ZW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQ0FBK0M7QUFDL0MsaUNBQWlDOztBQUVqQyxJQUFJLFNBQVMsQ0FBQztBQUNkLEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDbEMsU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUNyQixDQUFDO0FBQUMsSUFBSSxDQUFDLENBQUM7SUFDTixTQUFTLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLENBQUM7QUFFRCxtQkFBd0IsVUFBVSxFQUFFLFFBQVE7SUFDMUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztJQUMxQztRQUNFLElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUV0RCxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0IsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELEdBQUcsQ0FBQyxDQUFDLElBQUksU0FBUyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDZixDQUFDO0FBcEJELDRCQW9CQyJ9