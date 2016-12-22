/// <reference path="../../index.d.ts" />

import Config from '../configuration';
import Model from '../model';

export default function deserialize(resource : japiResource) : Model {
  let klass = Config.modelForType(resource.type);

  let instance = new klass({ id: resource.id });
  for (let key in resource.attributes) {
    instance[key] = resource.attributes[key];
  }
  instance.__meta__ = resource.meta;

  return instance;
}
