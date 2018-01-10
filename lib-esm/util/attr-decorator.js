export default function (decorator) {
    return function (target, attrName, descriptor) {
        if (!target['__attrDecorators'])
            target['__attrDecorators'] = [];
        target['__attrDecorators'].push({ attrName: attrName, decorator: decorator });
    };
}
//# sourceMappingURL=attr-decorator.js.map