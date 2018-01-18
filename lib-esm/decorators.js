import { pluralize, underscore } from "inflected";
import { applyModelConfig, isModelClass, isModelInstance } from "./model";
import { Attribute } from "./attribute";
import { HasMany, HasOne, BelongsTo } from "./associations";
import { config as envConfig, inBrowser } from "./util/env";
import { logger } from "./logger";
var ModelDecorator = function (config) {
    return function (target) {
        modelFactory(target, config);
        return target;
    };
};
export var initModel = function (modelClass, config) {
    modelFactory(modelClass, config);
};
var modelFactory = function (ModelClass, config) {
    ensureModelInheritance(ModelClass);
    applyModelConfig(ModelClass, config || {});
    if (!ModelClass.jsonapiType && !ModelClass.isBaseClass) {
        ModelClass.jsonapiType = pluralize(underscore(ModelClass.name));
        if (envConfig.productionTip && inBrowser) {
            logger.warn("Inferring model jsonapiType as \"" + ModelClass.jsonapiType + "\".\nYou should explicitly set this on your model if targeting a minified code bundle.");
        }
    }
    ModelClass.registerType();
};
var AttrDecoratorFactory = function (configOrTarget, propertyKey, attrConfig) {
    var attrDefinition = new Attribute({ name: propertyKey });
    var attrFunction = function (ModelClass, propKey) {
        ensureModelInheritance(ModelClass);
        if (!attrDefinition.name) {
            attrDefinition.name = propKey;
        }
        ModelClass.attributeList[propKey] = attrDefinition;
        attrDefinition.apply(ModelClass);
        return attrDefinition.descriptor();
    };
    if (isModelClass(configOrTarget) || isModelInstance(configOrTarget)) {
        // For type checking. Can't have a model AND no property key
        if (!propertyKey) {
            throw new Error("Must provide a propertyKey");
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
        return function (target, propKey) {
            return attrFunction(target.constructor, propKey);
        };
    }
};
var ensureModelInheritance = function (ModelClass) {
    if (ModelClass.currentClass !== ModelClass) {
        ModelClass.currentClass.inherited(ModelClass);
    }
};
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
var AssociationDecoratorFactoryBuilder = function (AttrType) {
    var DecoratorFactory = function (targetOrConfig, propertyKey, optsOrType) {
        var extend = function (ModelClass) {
            ensureModelInheritance(ModelClass);
            return ModelClass;
        };
        var opts;
        var factoryFn = function (target, propKey) {
            if (optsOrType === undefined) {
                var inferredType = pluralize(underscore(propKey));
                opts = {
                    jsonapiType: inferredType
                };
            }
            else if (typeof optsOrType === "string") {
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
                    name: optsOrType.name
                };
                if (typeof optsOrType.type === "string") {
                    opts.jsonapiType = optsOrType.type;
                }
                else {
                    opts.type = optsOrType.type;
                }
            }
            var attrDefinition = new AttrType(opts);
            if (!attrDefinition.name) {
                attrDefinition.name = propKey;
            }
            var ModelClass = extend(target.constructor);
            ModelClass.attributeList[propKey] = attrDefinition;
            attrDefinition.owner = target.constructor;
            attrDefinition.apply(ModelClass);
            attrDefinition.descriptor();
        };
        if (isModelClass(targetOrConfig) && propertyKey) {
            var target = targetOrConfig;
            factoryFn(target.prototype, propertyKey);
        }
        else {
            optsOrType = targetOrConfig;
            return factoryFn;
        }
    };
    return DecoratorFactory;
};
var HasManyDecoratorFactory = AssociationDecoratorFactoryBuilder(HasMany);
var HasOneDecoratorFactory = AssociationDecoratorFactoryBuilder(HasOne);
var BelongsToDecoratorFactory = AssociationDecoratorFactoryBuilder(BelongsTo);
export { ModelDecorator as Model, AttrDecoratorFactory as Attr, HasManyDecoratorFactory as HasMany, HasOneDecoratorFactory as HasOne, BelongsToDecoratorFactory as BelongsTo };
//# sourceMappingURL=decorators.js.map