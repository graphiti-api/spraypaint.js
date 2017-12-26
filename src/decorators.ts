import cloneDeep from './util/clonedeep'
import { 
  applyModelConfig,
  ExtendOptions,
  isModelInstance,
  Model, 
  ModelConfiguration, 
  ModelConfigurationOptions, 
  ModelConstructor,
  isModelClass, 
} from './model'

import { 
  Attribute, 
  AttributeOptions 
} from './attribute'

const ModelDecorator = function(config? : ModelConfigurationOptions) {
  return function<M extends typeof Model>(target: M) : M {
    return modelFactory(target, config)
  }
}

function modelFactory<M extends typeof Model>(ModelClass : typeof Model, config? : ModelConfigurationOptions) : M {
  ensureModelInheritance(ModelClass)
  ensureClonedAttrList(ModelClass)

  if (config) {
    applyModelConfig(ModelClass, config)
  }

  const decorated : any = class extends ModelClass {
    constructor(attrs: Record<string, any>) {
      super(attrs)
      this._klass = ModelClass
    }
  }

  return decorated
}

function AttrDecoratorFactory(config? : AttributeOptions) : PropertyDecorator
function AttrDecoratorFactory(target : Model, propertyKey : string) : void
function AttrDecoratorFactory(configOrTarget? : Model | AttributeOptions | undefined, propertyKey? : string) : any {
  let attrDefinition = new Attribute({name: propertyKey})

  const attrFunction = function(ModelClass : typeof Model, propertyKey : string | symbol) : PropertyDescriptor {
    ensureClonedAttrList(ModelClass)

    ModelClass.attributeList[propertyKey] = attrDefinition

    return attrDefinition.descriptor()
  }

  if (isModelInstance(configOrTarget) ) {
    // For type checking. Can't have a model AND no property key
    if (!propertyKey) {
      throw new Error('This should not be possible')
    }
    let target : Model = configOrTarget

    ensureModelInheritance(<any>target.constructor)

    attrFunction(<any>target.constructor, propertyKey)
  } else {
    if (configOrTarget) {
      attrDefinition = new Attribute(Object.assign({name: propertyKey}, configOrTarget))
    }

    return attrFunction
  }
}

function ensureModelInheritance(ModelClass : typeof Model) {
  if (ModelClass.currentClass !== ModelClass) {
    ModelClass.parentClass = ModelClass.currentClass
    ModelClass.currentClass = ModelClass
  }
}

function ensureClonedAttrList(ModelClass : typeof Model) {
  if (ModelClass.attributeList === ModelClass.parentClass.attributeList) {
    ModelClass.attributeList = Object.assign({}, ModelClass.parentClass.attributeList)
  }
}

export { ModelDecorator as Model, AttrDecoratorFactory as attr }