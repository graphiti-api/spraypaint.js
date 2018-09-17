import { SpraypaintBase } from "./model"
import { Association } from "./associations"
import { cloneDeep } from "./util/clonedeep"
import { EventBus } from './event-bus'

export class IDMap {
  data: Record<string, any> = {}

  get count() {
    return Object.keys(this.data).length
  }

  find(model: SpraypaintBase, key: string | null = null) {
    if (!key) key = model.storeKey
    return this.data[key]
  }

  findAll(models: SpraypaintBase[]) {
    let records: SpraypaintBase[] = []
    models.forEach((m) => {
      let found = this.find(m)
      if (found) {
        records.push(found)
      }
    })
    return records
  }

  create(model: SpraypaintBase, key: string) {
    model.storeKey = key
    model.stale = false
    this.data[key] = cloneDeep(model.attributes)
  }

  updateOrCreate(model: SpraypaintBase) {
    if (model.storeKey) {
      this.create(model, model.storeKey)
    } else {
      let key = this.keyFor(model)
      this.create(model, key)
    }

    EventBus.dispatch(model.storeKey, {}, this.data[model.storeKey])
  }

  destroy(model: SpraypaintBase) {
    model.stale = true
    delete this.data[model.storeKey]
  }

  private keyFor(model: SpraypaintBase) {
    return `${model.klass.jsonapiType}-${model.id}`
  }
}
