import { pluralize, underscore } from 'inflected'

import { 
  applyModelConfig,
  JSORMBase, 
  ModelConfiguration, 
  ModelConfigurationOptions,
  isModelClass, 
  isModelInstance,
} from './model'

import { 
  Attribute, 
  AttributeOptions 
} from './attribute'

import {
  AssociationFactoryOpts,
  AssociationRecord,
  HasMany,
  HasOne,
  BelongsTo,
} from './associations'

type ModelDecorator = <M extends typeof JSORMBase>(target: M) => M 

function ModelDecorator(config? : ModelConfigurationOptions) : ModelDecorator {
  return function<M extends typeof JSORMBase>(target: M) : M {
    modelFactory(target, config)
    return target
  }
}

export function initModel(modelClass : typeof JSORMBase, config?: ModelConfigurationOptions) : void {
  modelFactory(modelClass, config)
}

function modelFactory<M extends typeof JSORMBase>(ModelClass : typeof JSORMBase, config? : ModelConfigurationOptions) : void {
  ensureModelInheritance(ModelClass)

  applyModelConfig(ModelClass, config || {})

  if (!ModelClass.jsonapiType && !ModelClass.isBaseClass) {
    ModelClass.jsonapiType = pluralize(underscore(ModelClass.name))
  }

  ModelClass.registerType()
}

function AttrDecoratorFactory(config? : AttributeOptions) : PropertyDecorator
function AttrDecoratorFactory(target : JSORMBase, propertyKey : string) : void
function AttrDecoratorFactory(target : typeof JSORMBase, propertyKey : string, config? : AttributeOptions) : void
function AttrDecoratorFactory(
  configOrTarget? : typeof JSORMBase | JSORMBase | AttributeOptions | undefined, 
  propertyKey? : string,
  attrConfig? : AttributeOptions
) : any {
  let attrDefinition = new Attribute({name: propertyKey})

  const attrFunction = function(ModelClass : typeof JSORMBase, propertyKey : string | symbol) : PropertyDescriptor {
    ensureModelInheritance(ModelClass)

    if (!attrDefinition.name) {
      attrDefinition.name = propertyKey
    }
    ModelClass.attributeList[propertyKey] = attrDefinition
    attrDefinition.apply(ModelClass)

    return attrDefinition.descriptor()
  }

  if((isModelClass(configOrTarget) || 
     isModelInstance(configOrTarget))) {
    // For type checking. Can't have a model AND no property key
    if (!propertyKey) {
      throw new Error('Must provide a propertyKey')
    }
    let target = configOrTarget

    if (isModelClass(target)) {
      if (attrConfig) {
        attrDefinition = new Attribute(attrConfig)
      }
      
      attrFunction(target, propertyKey)
    } else {
      return attrFunction(<any>target.constructor, propertyKey)
    }
  } else {
    if (configOrTarget) {
      attrDefinition = new Attribute(configOrTarget)
    }

    return function(target : JSORMBase, propertyKey : string | symbol) {
      return attrFunction(<any>target.constructor, propertyKey)
    }
  }
}

function ensureModelInheritance(ModelClass : typeof JSORMBase) {
  if (ModelClass.currentClass !== ModelClass) {
    ModelClass.currentClass.inherited(ModelClass)
  }
}

type DecoratorFn = (target : JSORMBase, propertyKey : string) => void
type DecoratorArgs<T extends JSORMBase> = AssociationFactoryOpts<T> | string | typeof JSORMBase
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
function AssociationDecoratorFactoryBuilder<T extends JSORMBase>(AttrType: any) {
  function DecoratorFactory(target: typeof JSORMBase, propertyKey : string, optsOrType?: AssociationFactoryOpts<T> | string) : void 
  function DecoratorFactory(optsOrType?: DecoratorArgs<T>) : DecoratorFn 
  function DecoratorFactory(
    targetOrConfig? : typeof JSORMBase | DecoratorArgs<T>, 
    propertyKey? : string,
    optsOrType?: DecoratorArgs<T>
  ) {
    function extend(ModelClass : typeof JSORMBase) : typeof JSORMBase {
      ensureModelInheritance(ModelClass)

      return ModelClass
    }

    let opts : AssociationRecord<T> | undefined

    const factoryFn = function(target: JSORMBase, propertyKey : string) {
      if (optsOrType === undefined) {
        let inferredType = pluralize(underscore(propertyKey))

        opts = {
          jsonapiType: inferredType
        }
      } else if(typeof optsOrType === 'string') {
        opts = {
          jsonapiType: optsOrType
        }
      } else if(isModelClass(optsOrType)) {
        opts = {
          type: optsOrType as any
        }
      } else {
        opts = {
          persist: optsOrType.persist,
          name: optsOrType.name,
        }

        if (typeof optsOrType.type === 'string') {
          opts.jsonapiType = optsOrType.type
        } else {
          opts.type = optsOrType.type as any
        }
      }

      let attrDefinition = new AttrType(opts)
      if (!attrDefinition.name) {
        attrDefinition.name = propertyKey
      }
    
      let ModelClass = extend(<any>target.constructor)
      
      ModelClass.attributeList[propertyKey] = attrDefinition
      attrDefinition.owner = target.constructor
      attrDefinition.apply(ModelClass)

      attrDefinition.descriptor()
    }

    if (isModelClass(targetOrConfig)) {
      if (!propertyKey) {
        optsOrType = targetOrConfig
        return factoryFn
      }

      let target = targetOrConfig

      factoryFn(target.prototype, propertyKey)
    } else {
      optsOrType = targetOrConfig
      return factoryFn
    }
  }

  return DecoratorFactory
}

const HasManyDecoratorFactory = AssociationDecoratorFactoryBuilder(HasMany)
const HasOneDecoratorFactory = AssociationDecoratorFactoryBuilder(HasOne)
const BelongsToDecoratorFactory = AssociationDecoratorFactoryBuilder(BelongsTo)

export { 
  ModelDecorator as Model, 
  AttrDecoratorFactory as Attr,
  HasManyDecoratorFactory as HasMany,
  HasOneDecoratorFactory as HasOne,
  BelongsToDecoratorFactory as BelongsTo,
}
