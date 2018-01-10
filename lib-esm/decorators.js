import { pluralize, underscore } from 'inflected';
import { applyModelConfig, isModelClass, isModelInstance, } from './model';
import { Attribute } from './attribute';
import { HasMany, HasOne, BelongsTo, } from './associations';
function ModelDecorator(config) {
    return function (target) {
        modelFactory(target, config);
        return target;
    };
}
export function initModel(modelClass, config) {
    modelFactory(modelClass, config);
}
function modelFactory(ModelClass, config) {
    ensureModelInheritance(ModelClass);
    applyModelConfig(ModelClass, config || {});
    if (!ModelClass.jsonapiType && !ModelClass.isBaseClass) {
        ModelClass.jsonapiType = pluralize(underscore(ModelClass.name));
    }
    ModelClass.registerType();
}
function AttrDecoratorFactory(configOrTarget, propertyKey, attrConfig) {
    var attrDefinition = new Attribute({ name: propertyKey });
    var attrFunction = function (ModelClass, propertyKey) {
        ensureModelInheritance(ModelClass);
        if (!attrDefinition.name) {
            attrDefinition.name = propertyKey;
        }
        ModelClass.attributeList[propertyKey] = attrDefinition;
        attrDefinition.apply(ModelClass);
        return attrDefinition.descriptor();
    };
    if ((isModelClass(configOrTarget) ||
        isModelInstance(configOrTarget))) {
        // For type checking. Can't have a model AND no property key
        if (!propertyKey) {
            throw new Error('Must provide a propertyKey');
        }
        var target = configOrTarget;
        if (isModelClass(target)) {
            if (attrConfig) {
                attrDefinition = new Attribute(attrConfig);
            }
            attrFunction(target, propertyKey);
        }
        else {
            return attrFunction(target.constructor, propertyKey);
        }
    }
    else {
        if (configOrTarget) {
            attrDefinition = new Attribute(configOrTarget);
        }
        return function (target, propertyKey) {
            return attrFunction(target.constructor, propertyKey);
        };
    }
}
function ensureModelInheritance(ModelClass) {
    if (ModelClass.currentClass !== ModelClass) {
        ModelClass.currentClass.inherited(ModelClass);
    }
}
/*
 * Yup that's a super-Java-y method name.  Decorators in
 * ES7/TS are either of the form:
 *
 * @decorator foo : string
 * or
 * @decorator(options) foo : string
 *
 * The first is a function that directly decorates the
 * property, while this second is a factory function
 * that returns a decorator function.
 *
 * This method builds the factory function for each of our
 * association types.
 *
 * Additionally, users without decorator support can apply these
 * to their ES6-compatible classes directly if they prefer:
 *
 * ``` javascript
 * class Person extends ApplicationRecord {
 *   fullName() { `${this.firstName} ${this.lastName} `}
 * }
 * Attr(Person, 'firstName')
 * Attr(Person, 'lastName')
 * BelongsTo(Person, 'mother', { type: Person })
 * ```
 *
 */
function AssociationDecoratorFactoryBuilder(AttrType) {
    function DecoratorFactory(targetOrConfig, propertyKey, optsOrType) {
        function extend(ModelClass) {
            ensureModelInheritance(ModelClass);
            return ModelClass;
        }
        var opts;
        var factoryFn = function (target, propertyKey) {
            if (optsOrType === undefined) {
                var inferredType = pluralize(underscore(propertyKey));
                opts = {
                    jsonapiType: inferredType
                };
            }
            else if (typeof optsOrType === 'string') {
                opts = {
                    jsonapiType: optsOrType
                };
            }
            else if (isModelClass(optsOrType)) {
                opts = {
                    type: optsOrType
                };
            }
            else {
                opts = {
                    persist: optsOrType.persist,
                    name: optsOrType.name,
                };
                if (typeof optsOrType.type === 'string') {
                    opts.jsonapiType = optsOrType.type;
                }
                else {
                    opts.type = optsOrType.type;
                }
            }
            var attrDefinition = new AttrType(opts);
            if (!attrDefinition.name) {
                attrDefinition.name = propertyKey;
            }
            var ModelClass = extend(target.constructor);
            ModelClass.attributeList[propertyKey] = attrDefinition;
            attrDefinition.owner = target.constructor;
            attrDefinition.apply(ModelClass);
            attrDefinition.descriptor();
        };
        if (isModelClass(targetOrConfig)) {
            if (!propertyKey) {
                optsOrType = targetOrConfig;
                return factoryFn;
            }
            var target = targetOrConfig;
            factoryFn(target.prototype, propertyKey);
        }
        else {
            optsOrType = targetOrConfig;
            return factoryFn;
        }
    }
    return DecoratorFactory;
}
var HasManyDecoratorFactory = AssociationDecoratorFactoryBuilder(HasMany);
var HasOneDecoratorFactory = AssociationDecoratorFactoryBuilder(HasOne);
var BelongsToDecoratorFactory = AssociationDecoratorFactoryBuilder(BelongsTo);
export { ModelDecorator as Model, AttrDecoratorFactory as Attr, HasManyDecoratorFactory as HasMany, HasOneDecoratorFactory as HasOne, BelongsToDecoratorFactory as BelongsTo, };
//# sourceMappingURL=decorators.js.map