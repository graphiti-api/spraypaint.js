"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parameterize(obj, prefix) {
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
exports.default = parameterize;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVyaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWwvcGFyYW1ldGVyaXplLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0JBQXFDLEdBQVMsRUFBRSxNQUFnQjtJQUM5RCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFFYixHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVyQixFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUQsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDWCxHQUFHLEdBQU0sTUFBTSxTQUFJLEdBQUcsTUFBRyxDQUFDO1lBQzVCLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQixHQUFHLENBQUMsSUFBSSxDQUFJLEdBQUcsU0FBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDLENBQUM7Z0JBQ3hDLENBQUM7WUFDSCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixHQUFHLENBQUMsSUFBSSxDQUFJLEdBQUcsU0FBSSxLQUFPLENBQUMsQ0FBQztZQUM5QixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QixDQUFDO0FBN0JELCtCQTZCQyJ9