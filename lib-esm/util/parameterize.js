export default function parameterize(obj, prefix) {
    var str = [];
    for (var key in obj) {
        var value = obj[key];
        if (value !== undefined && value !== null && value !== '') {
            if (prefix) {
                key = prefix + "[" + key + "]";
            }
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    str.push(key + "=" + value.join(','));
                }
            }
            else if (typeof value == "object") {
                str.push(parameterize(value, key));
            }
            else {
                str.push(key + "=" + value);
            }
        }
    }
    // remove blanks
    str = str.filter(function (p) {
        return !!p;
    });
    return str.join("&");
}
//# sourceMappingURL=parameterize.js.map