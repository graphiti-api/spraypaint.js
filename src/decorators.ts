import { default as Model, ModelConstructor, ExtendOptions } from './model'

export interface ModelConfiguration {

}

const ModelDecorator = function(config? : ModelConfiguration) {
  return function(ModelClass: typeof Model) {
    return modelFactory(ModelClass, config)
  }
}

function modelFactory<M extends typeof Model>(ModelClass : typeof Model, config? : ModelConfiguration) {
  return class Foo extends Model {

  }
}

export { ModelDecorator as Model }