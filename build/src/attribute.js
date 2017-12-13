"use strict";
// In the future, this class will be used for
// transforms, default values, etc.
Object.defineProperty(exports, "__esModule", { value: true });
var configuration_1 = require("./configuration");
var Attribute = /** @class */ (function () {
    function Attribute(opts) {
        this.persist = true;
        this.isAttr = true;
        this.isRelationship = false;
        if (opts && opts.hasOwnProperty('persist')) {
            this.persist = opts.persist;
        }
    }
    Attribute.applyAll = function (klass) {
        this._eachAttribute(klass, function (attr) {
            klass.attributeList[attr.name] = attr;
            var descriptor = attr.descriptor();
            Object.defineProperty(klass.prototype, attr.name, descriptor);
            var instance = new klass();
            var decorators = instance['__attrDecorators'] || [];
            decorators.forEach(function (d) {
                if (d['attrName'] === attr.name) {
                    d['decorator'](klass.prototype, attr.name, descriptor);
                }
            });
        });
    };
    Attribute._eachAttribute = function (klass, callback) {
        var instance = new klass();
        for (var propName in instance) {
            if (instance[propName] && instance[propName].hasOwnProperty('isAttr')) {
                var attrInstance = instance[propName];
                attrInstance.name = propName;
                if (attrInstance.isRelationship) {
                    attrInstance.klass = configuration_1.default.modelForType(attrInstance.jsonapiType || attrInstance.name);
                }
                callback(attrInstance);
            }
        }
    };
    // This returns the getters/setters for use on the *model*
    Attribute.prototype.descriptor = function () {
        var attr = this;
        return {
            enumerable: true,
            get: function () {
                return attr.getter(this);
            },
            set: function (value) {
                if (!value || !value.hasOwnProperty('isAttr')) {
                    attr.setter(this, value);
                }
            }
        };
    };
    // The model calls this setter
    Attribute.prototype.setter = function (context, val) {
        context.attributes[this.name] = val;
    };
    // The model calls this getter
    Attribute.prototype.getter = function (context) {
        return context.attributes[this.name];
    };
    return Attribute;
}());
exports.default = Attribute;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0cmlidXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2F0dHJpYnV0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsNkNBQTZDO0FBQzdDLG1DQUFtQzs7QUFHbkMsaURBQXFDO0FBRXJDO0lBT0UsbUJBQVksSUFBdUI7UUFKbkMsWUFBTyxHQUFZLElBQUksQ0FBQztRQUN4QixXQUFNLEdBQVksSUFBSSxDQUFDO1FBQ3ZCLG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBRzlCLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDOUIsQ0FBQztJQUNILENBQUM7SUFFTSxrQkFBUSxHQUFmLFVBQWdCLEtBQW1CO1FBQ2pDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFVBQUMsSUFBSTtZQUM5QixLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDdEMsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlELElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFFM0IsSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3BELFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDO2dCQUNuQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3pELENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVjLHdCQUFjLEdBQTdCLFVBQThCLEtBQW1CLEVBQUUsUUFBa0I7UUFDbkUsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUMzQixHQUFHLENBQUMsQ0FBQyxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzlCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdEUsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN0QyxZQUFZLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztnQkFFN0IsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLFlBQVksQ0FBQyxLQUFLLEdBQUcsdUJBQU0sQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFdBQVcsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFGLENBQUM7Z0JBRUQsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3pCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELDBEQUEwRDtJQUMxRCw4QkFBVSxHQUFWO1FBQ0UsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWhCLE1BQU0sQ0FBQztZQUNMLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLEdBQUcsRUFBSDtnQkFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQixDQUFDO1lBRUQsR0FBRyxFQUFILFVBQUksS0FBSztnQkFDUCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDM0IsQ0FBQztZQUNILENBQUM7U0FDRixDQUFBO0lBQ0gsQ0FBQztJQUVELDhCQUE4QjtJQUM5QiwwQkFBTSxHQUFOLFVBQU8sT0FBYyxFQUFFLEdBQVE7UUFDN0IsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ3RDLENBQUM7SUFFRCw4QkFBOEI7SUFDOUIsMEJBQU0sR0FBTixVQUFPLE9BQWM7UUFDbkIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDSCxnQkFBQztBQUFELENBQUMsQUF6RUQsSUF5RUMifQ==