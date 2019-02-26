import { pluralize, underscore } from "inflected"

import {
  applyModelConfig,
  SpraypaintBase,
  ModelConfiguration,
  ModelConfigurationOptions,
  isModelClass,
  isModelInstance
} from "./model"

import { Attribute, AttributeOptions } from "./attribute"

import {
  AssociationFactoryOpts,
  AssociationRecord,
  HasMany,
  HasOne,
  BelongsTo
} from "./associations"

import { config as envConfig, inBrowser, config } from "./util/env"
import { logger } from "./logger"

export type DecoratorPlacement = "static" | "prototype" | "own"
export interface EcmaDecoratorDescriptor {
  kind: "class" | "method" | "field"
  key: string
  placement: DecoratorPlacement
}

export interface FieldDecoratorDescriptor extends EcmaDecoratorDescriptor {
  kind: "field"
}

type DecoratorDescriptor<T> = T | EcmaDecoratorDescriptor

function shimDecoratorProposalCompatibility<Decorator, T extends Function>(
  finisher: T
): T {
  return (function(descriptor: DecoratorDescriptor<Decorator>) {
    if (isModernDecoratorDescriptor(descriptor)) {
      return Object.assign(descriptor, {
        finisher
      })
    } else {
      return finisher(descriptor)
    }
  } as any) as T
}

const isModernDecoratorDescriptor = (
  obj: any
): obj is EcmaDecoratorDescriptor => {
  return obj && obj.kind !== undefined
}

type ModelDecorator = <M extends typeof SpraypaintBase>(target: M) => M

const ModelDecorator = (config?: ModelConfigurationOptions): ModelDecorator => {
  return shimDecoratorProposalCompatibility(
    <M extends typeof SpraypaintBase>(target: M): M => {
      modelFactory(target, config)
      return target
    }
  )
}

export const initModel = (
  modelClass: typeof SpraypaintBase,
  config?: ModelConfigurationOptions
): void => {
  modelFactory(modelClass, config)
}

const modelFactory = <M extends typeof SpraypaintBase>(
  ModelClass: typeof SpraypaintBase,
  config?: ModelConfigurationOptions
): void => {
  ensureModelInheritance(ModelClass)

  applyModelConfig(ModelClass, config || {})

  if (!ModelClass.jsonapiType && !ModelClass.isBaseClass) {
    ModelClass.jsonapiType = pluralize(underscore(ModelClass.name))

    if (envConfig.productionTip && inBrowser) {
      logger.warn(
        `Inferring model jsonapiType as "${
          ModelClass.jsonapiType
        }".\nYou should explicitly set this on your model if targeting a minified code bundle.`
      )
    }
  }

  ModelClass.registerType()
}

const AttrDecoratorFactory: {
  (config?: AttributeOptions): PropertyDecorator
  (target: SpraypaintBase, propertyKey: string): void
  (
    target: typeof SpraypaintBase,
    propertyKey: string,
    config?: AttributeOptions
  ): void
  (fieldDetails: FieldDecoratorDescriptor): void
} = (
  configOrTarget?:
    | typeof SpraypaintBase
    | SpraypaintBase
    | AttributeOptions
    | FieldDecoratorDescriptor
    | undefined,
  propertyKey?: string,
  attrConfig?: AttributeOptions
): any => {
  let attrDefinition = new Attribute({ name: propertyKey })

  const attrFunction = (
    ModelClass: typeof SpraypaintBase,
    propKey: string
  ): PropertyDescriptor => {
    ensureModelInheritance(ModelClass)

    if (!attrDefinition.name) {
      attrDefinition.name = propKey
    }
    ModelClass.attributeList[propKey] = attrDefinition
    attrDefinition.apply(ModelClass)

    return attrDefinition.descriptor()
  }

  if (isModernDecoratorDescriptor(configOrTarget)) {
    return Object.assign(configOrTarget, {
      finisher(Model: typeof SpraypaintBase) {
        attrFunction(Model, configOrTarget.key)
      }
    })
  } else if (isModelClass(configOrTarget) || isModelInstance(configOrTarget)) {
    // For type checking. Can't have a model AND no property key
    if (!propertyKey) {
      throw new Error("Must provide a propertyKey")
    }
    const target = configOrTarget

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

    return (target: SpraypaintBase, propKey: string) => {
      return attrFunction(<any>target.constructor, propKey)
    }
  }
}

const LinkDecoratorFactory = function(
  fieldDetail?: FieldDecoratorDescriptor
): any {
  const trackLink = (Model: typeof SpraypaintBase, propKey: string) => {
    ensureModelInheritance(Model)
    Model.linkList.push(propKey)
  }

  if (isModernDecoratorDescriptor(fieldDetail)) {
    return Object.assign(fieldDetail, {
      finisher: (Model: typeof SpraypaintBase) => {
        trackLink(Model, fieldDetail.key)
      }
    })
  } else {
    return (target: SpraypaintBase, propKey: string) => {
      trackLink(<any>target.constructor, propKey)
    }
  }
}

const ensureModelInheritance = (ModelClass: typeof SpraypaintBase) => {
  if (ModelClass.currentClass !== ModelClass) {
    ModelClass.currentClass.inherited(ModelClass)
  }
}

type DecoratorFn = (target: SpraypaintBase, propertyKey: string) => void
type DecoratorArgs<T extends SpraypaintBase> =
  | AssociationFactoryOpts<T>
  | string
  | typeof SpraypaintBase
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

const AssociationDecoratorFactoryBuilder = <T extends SpraypaintBase>(
  AttrType: any
) => {
  const DecoratorFactory: {
    (optsOrType?: DecoratorArgs<T>): DecoratorFn
    (
      target: typeof SpraypaintBase,
      propertyKey: string,
      optsOrType?: AssociationFactoryOpts<T> | string
    ): DecoratorFn
    (decoratorDescriptor: FieldDecoratorDescriptor): FieldDecoratorDescriptor
  } = (
    targetOrConfig?:
      | typeof SpraypaintBase
      | DecoratorArgs<T>
      | FieldDecoratorDescriptor,
    propertyKey?: string,
    optsOrType?: DecoratorArgs<T>
  ): any => {
    const extend = (
      ModelClass: typeof SpraypaintBase
    ): typeof SpraypaintBase => {
      ensureModelInheritance(ModelClass)

      return ModelClass
    }

    let opts: AssociationRecord<T> | undefined

    const factoryFn = (target: SpraypaintBase, propKey: string) => {
      if (optsOrType === undefined) {
        const inferredType = pluralize(underscore(propKey))

        opts = {
          jsonapiType: inferredType
        }
      } else if (typeof optsOrType === "string") {
        opts = {
          jsonapiType: optsOrType
        }
      } else if (isModelClass(optsOrType)) {
        opts = {
          type: optsOrType as any
        }
      } else {
        opts = {
          persist: optsOrType.persist,
          name: optsOrType.name
        }

        if (typeof optsOrType.type === "string") {
          opts.jsonapiType = optsOrType.type
        } else {
          opts.type = optsOrType.type as any
        }
      }

      const attrDefinition = new AttrType(opts)
      if (!attrDefinition.name) {
        attrDefinition.name = propKey
      }

      const ModelClass = extend(<any>target.constructor)

      ModelClass.attributeList[propKey] = attrDefinition
      attrDefinition.owner = target.constructor
      attrDefinition.apply(ModelClass)

      return attrDefinition.descriptor()
    }

    if (isModernDecoratorDescriptor(targetOrConfig)) {
      return Object.assign(targetOrConfig, {
        finisher(ModelClass: typeof SpraypaintBase) {
          factoryFn(ModelClass.prototype, targetOrConfig.key)
        }
      })
    } else if (isModelClass(targetOrConfig) && propertyKey) {
      const target = targetOrConfig

      factoryFn(target.prototype, propertyKey)
    } else {
      const fn: {
        (target: SpraypaintBase, propKey: string): void
        (descriptor: FieldDecoratorDescriptor): void
      } = (
        targetOrDescriptor: SpraypaintBase | FieldDecoratorDescriptor,
        propKey?: string
      ) => {
        if (isModernDecoratorDescriptor(targetOrDescriptor)) {
          return Object.assign(targetOrDescriptor, {
            finisher(ModelClass: typeof SpraypaintBase) {
              factoryFn(ModelClass.prototype, targetOrDescriptor.key)
            }
          })
        } else {
          optsOrType = targetOrConfig
          return factoryFn(targetOrDescriptor, propKey as string)
        }
      }
      return fn
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
  LinkDecoratorFactory as Link,
  HasManyDecoratorFactory as HasMany,
  HasOneDecoratorFactory as HasOne,
  BelongsToDecoratorFactory as BelongsTo
}
