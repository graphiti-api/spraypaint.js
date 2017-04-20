/// <reference path="../index.d.ts" />

import Config from '../configuration';
import Model from '../model';
import { camelize } from './string';

function deserialize(resource : japiResource, payload: japiDoc) : Model {
  let deserializer = new Deserializer(payload);
  return deserializer.deserialize(resource);
}

function deserializeInstance(instance: Model, resource : japiResource, payload: japiDoc) : Model {
  let deserializer = new Deserializer(payload);
  return deserializer.deserializeInstance(instance, resource);
}

class Deserializer {
  _models = [];
  _resources = [];
  payload: japiDoc;

  constructor(payload) {
    this.payload = payload;
    this.addResources(payload.data);
    this.addResources(payload.included);
  }

  addResources(data) {
    if (!data) return;

    if (Array.isArray(data)) {
      for (let datum of data) {
        this._resources.push(datum);
      }
    } else {
      this._resources.push(data);
    }
  }

  deserialize(resource: japiResource, isRelation?: boolean) : Model {
    let record = this.findModel(resource);
    if (!record) {
      if (isRelation) {
        let hydrated = this.findResource(resource);
        if (hydrated) resource = hydrated;
      }
      let klass = Config.modelForType(resource.type);
      let instance = new klass();
      record = this.deserializeInstance(instance, resource);
      record.isPersisted(true);
    }

    return record;
  }

  deserializeInstance(instance: Model, resource: japiResource) : Model {
    instance.id = resource.id;
    this._models.push(instance);

    instance.attributes = resource.attributes;
    this._processRelationships(instance, resource.relationships);
    instance.__meta__ = resource.meta;
    instance.isPersisted(true);
    return instance;
  }

  _pushRelationship(instance: Model, associationName: string, relatedRecord: Model) {
    let records = instance[associationName];
    let existingIndex = this._existingRecordIndex(records, relatedRecord);
    if (existingIndex > -1) {
      if (records[existingIndex].isMarkedForDestruction()) {
        records.splice(existingIndex, 1);
      } else {
        records[existingIndex] = relatedRecord;
      }
    } else {
      records.push(relatedRecord);
    }
    instance[associationName] = records;
  }

  _existingRecordIndex(records: Array<Model>, record: Model) : number {
    let index = -1;
    records.forEach((r, i) => {
      if ((r.temp_id && r.temp_id === record.temp_id) || (r.id && r.id === record.id)) {
        index = i;
      }
    });
    return index;
  }

  _processRelationships(instance, relationships) {
    this._iterateValidRelationships(instance, relationships, (relationName, relationData) => {
      if (Array.isArray(relationData)) {
        for (let datum of relationData) {
          let relatedRecord = this.deserialize(datum, true);
          relatedRecord.temp_id = datum['temp-id'];
          this._pushRelationship(instance, relationName, relatedRecord)
          relatedRecord.temp_id = null;
        }
      } else {
        if (instance[relationName] && instance[relationName].isMarkedForDestruction()) {
          instance[relationName] = null;
        } else {
          // todo belongsto destruction test removes relation
          let relatedRecord = this.deserialize(relationData, true);
          relatedRecord.temp_id = null;
          instance[relationName] = relatedRecord;
        }
      }
    });
  }

  _iterateValidRelationships(instance, relationships, callback) {
    for (let key in relationships) {
      let relationName = camelize(key);
      if (instance.klass.attributeList.indexOf(relationName) >= 0) {
        let relationData = relationships[key].data;
        if(!relationData) continue; // only links, empty, etc
        callback(relationName, relationData);
      }
    }
  }

  findModel(resourceIdentifier) {
    return this._models.filter((m) => {
      return m.id == resourceIdentifier.id && m.klass.jsonapiType == resourceIdentifier.type;
    })[0];
  }

  findResource(resourceIdentifier) {
    return this._resources.filter((r) => {
      return r.id == resourceIdentifier.id && r.type == resourceIdentifier.type;
    })[0];
  }
}

export { deserialize, deserializeInstance };
