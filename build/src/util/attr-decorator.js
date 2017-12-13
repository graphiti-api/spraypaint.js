"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(decorator) {
    return function (target, attrName, descriptor) {
        if (!target['__attrDecorators'])
            target['__attrDecorators'] = [];
        target['__attrDecorators'].push({ attrName: attrName, decorator: decorator });
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0ci1kZWNvcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbC9hdHRyLWRlY29yYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1CQUF3QixTQUFtQjtJQUN6QyxNQUFNLENBQUMsVUFBUyxNQUFXLEVBQUUsUUFBZ0IsRUFBRSxVQUE4QjtRQUMzRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2pFLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsVUFBQSxFQUFFLFNBQVMsV0FBQSxFQUFFLENBQUMsQ0FBQztJQUMzRCxDQUFDLENBQUE7QUFDSCxDQUFDO0FBTEQsNEJBS0MifQ==