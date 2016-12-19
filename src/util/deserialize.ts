/// <reference path="../../index.d.ts" />

import Config from '../configuration';

export default function deserialize(resource : japiResource) : IModel {
  let klass = Config.models[resource.type];

  let instance = new klass({ id: resource.id });
  return instance;
}
