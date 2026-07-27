import { JsonapiTypeRegistry } from "../jsonapi-type-registry"
import { SpraypaintBase } from "../model"
import {
  IncludeDirective,
  IncludeScopeHash,
  IncludeArgHash
} from "./include-directive"
import { JsonapiResource, JsonapiResponseDoc } from "../jsonapi-spec"

const deserialize = (
  registry: JsonapiTypeRegistry,
  datum: JsonapiResource,
  payload: JsonapiResponseDoc
): SpraypaintBase => {
  const deserializer = new Deserializer(registry, payload)
  return deserializer.deserialize(datum)
}

const deserializeInstance = (
  instance: SpraypaintBase,
  resource: JsonapiResource,
  payload: JsonapiResponseDoc,
  includeDirective: IncludeScopeHash = {}
): SpraypaintBase => {
  const deserializer = new Deserializer(instance.klass.typeRegistry, payload)
  return deserializer.deserializeInstance(instance, resource, includeDirective)
}

class Deserializer {
  payload: JsonapiResponseDoc
  registry: JsonapiTypeRegistry
  private _deserialized: SpraypaintBase[] = []
  private _resources: JsonapiResource[] = []

  constructor(registry: JsonapiTypeRegistry, payload: JsonapiResponseDoc) {
    this.registry = registry
    this.payload = payload

    this.addResources(payload.data)
    this.addResources(payload.included)
  }

  addResources(data?: JsonapiResource[] | JsonapiResource) {
    if (!data) {
      return
    }

    if (Array.isArray(data)) {
      for (const datum of data) {
        this._resources.push(datum)
      }
    } else {
      this._resources.push(data)
    }
  }

  instanceFor(type: string): SpraypaintBase {
    const klass = this.registry.get(type)

    if (!klass) {
      throw new Error(`Unknown type "${type}"`)
    }

    return new klass()
  }

  relationshipInstanceFor(
    datum: JsonapiResource,
    records: SpraypaintBase[]
  ): SpraypaintBase {
    let record = records.find(r => {
      return !!(
        r.klass.jsonapiType === datum.type &&
        ((r.id && datum.id && r.id === datum.id) ||
          (r.temp_id && datum["temp-id"] && r.temp_id === datum["temp-id"]))
      )
    })

    if (!record) {
      record = this.instanceFor(datum.type)
    }

    return record
  }

  // todo null temp id
  lookupAssociated(recordSet: SpraypaintBase[], record: SpraypaintBase) {
    return recordSet.find(r => {
      return !!(
        r.klass.jsonapiType === record.klass.jsonapiType &&
        ((r.temp_id && record.temp_id && r.temp_id === record.temp_id) ||
          (r.id && record.id && r.id === record.id))
      )
    })
  }

  pushRelation(
    model: SpraypaintBase,
    associationName: string,
    record: SpraypaintBase
  ): void {
    const modelIdx = model as any
    const associationRecords = modelIdx[associationName] || []
    const existingInstance = this.lookupAssociated(associationRecords, record)

    if (existingInstance) return
    if (Array.isArray(modelIdx[associationName])) {
      modelIdx[associationName].push(record)
    } else {
      modelIdx[associationName] = record
    }
  }

  deserialize(datum: JsonapiResource): SpraypaintBase {
    const instance = this.instanceFor(datum.type)
    return this.deserializeInstance(instance, datum, {})
  }

  deserializeInstance(
    instance: SpraypaintBase,
    datum: JsonapiResource,
    includeDirective: IncludeScopeHash = {}
  ): SpraypaintBase {
    const existing = this.alreadyDeserialized(datum)
    if (existing) {
      return existing
    }

    // assign ids
    instance.id = datum.id
    instance.temp_id = datum["temp-id"]

    // assign attrs
    instance.assignAttributes(datum.attributes)

    // assign links
    instance.assignLinks(datum.links)

    // assign meta
    instance.setMeta(datum.meta, false)

    // so we don't double-process the same thing
    // must push before relationships
    this._deserialized.push(instance)
    this._processRelationships(
      instance,
      datum.relationships || ({} as any),
      includeDirective
    )

    // remove objects marked for destruction
    this._removeDeletions(instance, includeDirective)

    // came from server, must be persisted
    instance.isPersisted = true
    instance.reset()

    return instance
  }

  _removeDeletions(model: SpraypaintBase, includeDirective: IncludeScopeHash) {
    Object.keys(includeDirective).forEach(key => {
      const modelIdx = model as any
      const relatedObjects = modelIdx[key]
      if (relatedObjects) {
        if (Array.isArray(relatedObjects)) {
          relatedObjects.forEach((relatedObject, index) => {
            if (relatedObject.isMarkedForDestruction) {
              modelIdx.klass.store.destroy(relatedObject)
            } else if (relatedObject.isMarkedForDisassociation) {
              modelIdx[key].splice(index, 1)
            } else {
              this._removeDeletions(relatedObject, includeDirective[key] || {})
            }
          })
        } else {
          const relatedObject = relatedObjects
          if (relatedObject.isMarkedForDestruction) {
            modelIdx.klass.store.destroy(relatedObject)
          } else if (relatedObject.isMarkedForDisassociation) {
            modelIdx[key] = null
          } else {
            this._removeDeletions(relatedObject, includeDirective[key] || {})
          }
        }
      }
    })
  }

  _processRelationships(
    instance: SpraypaintBase,
    relationships: Record<string, JsonapiResponseDoc>,
    includeDirective: IncludeScopeHash
  ) {
    this._iterateValidRelationships(
      instance,
      relationships,
      (relationName, relationData) => {
        const nestedIncludeDirective = includeDirective[relationName]
        const instanceIdx = instance as any

        if (Array.isArray(relationData)) {
          for (const datum of relationData) {
            const hydratedDatum = this.findResource(datum)
            const associationRecords = instanceIdx[relationName] || []
            let relatedInstance = this.relationshipInstanceFor(
              hydratedDatum,
              associationRecords
            )
            relatedInstance = this.deserializeInstance(
              relatedInstance,
              hydratedDatum,
              nestedIncludeDirective
            )

            this.pushRelation(instance, relationName, relatedInstance)
          }
        } else {
          const hydratedDatum = this.findResource(relationData)
          const existing = instanceIdx[relationName]
          let associated = existing || this.instanceFor(hydratedDatum.type)

          associated = this.deserializeInstance(
            associated,
            hydratedDatum,
            nestedIncludeDirective
          )

          if (!existing) {
            instanceIdx[relationName] = associated
          }
        }
      }
    )
  }

  _iterateValidRelationships(
    instance: SpraypaintBase,
    relationships: Record<string, JsonapiResponseDoc>,
    callback: (name: string, data: JsonapiResource[] | JsonapiResource) => void
  ) {
    for (const key in relationships) {
      if (relationships.hasOwnProperty(key)) {
        let relationName = instance.klass.deserializeKey(key)

        if (instance.klass.attributeList[relationName]) {
          const relationData = relationships[key].data
          if (!relationData) {
            continue
          } // only links, empty, etc
          callback(relationName, relationData)
        }
      }
    }
  }

  alreadyDeserialized(resourceIdentifier: JsonapiResource) {
    return this._deserialized.find(m => {
      return !!(
        m.klass.jsonapiType === resourceIdentifier.type &&
        ((m.id && resourceIdentifier.id && m.id === resourceIdentifier.id) ||
          (m.temp_id &&
            resourceIdentifier.temp_id &&
            m.temp_id === resourceIdentifier["temp-id"]))
      )
    })
  }

  findResource(resourceIdentifier: JsonapiResource) {
    const found = this._resources.find(
      (r): boolean => {
        return !!(
          r.type === resourceIdentifier.type &&
          ((r.id && resourceIdentifier.id && r.id === resourceIdentifier.id) ||
            (r["temp-id"] &&
              resourceIdentifier["temp-id"] &&
              r["temp-id"] === resourceIdentifier["temp-id"]))
        )
      }
    )

    return found || resourceIdentifier
  }
}

export { deserialize, deserializeInstance }
