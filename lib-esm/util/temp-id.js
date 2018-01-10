var memo = 0;
var generate = function () {
    memo++;
    return "temp-id-" + memo;
};
var tempId = {
    generate: generate
};
export { tempId, generate as generateTempId };
//# sourceMappingURL=temp-id.js.map