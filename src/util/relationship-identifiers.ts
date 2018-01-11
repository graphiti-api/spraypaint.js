import { JSORMBase } from '../model'
import { JsonapiResourceIdentifier } from '../jsonapi-spec'

// Build a hash like
// {
//   posts: [{id: 1, type: 'posts'}],
//   category: [{id: 1, type: 'categories}]
// }
// Will be array regardless of relationship type
// This will only contain persisted objects
// Used for dirty tracking associations
export default (model : JSORMBase, relationNames : string[]) => {
  let identifiers : Record<string, JsonapiResourceIdentifier[]>= {}
  relationNames.forEach((relationName) => {
    let relatedObjects = model.relationship(relationName)
    if (relatedObjects) {
      if (!Array.isArray(relatedObjects)) { 
        relatedObjects = [relatedObjects] 
      }

      relatedObjects.forEach((r) => {
        if (r.isPersisted) {
          if (!identifiers[relationName]) {
            identifiers[relationName] = []
          }
          identifiers[relationName].push(r.resourceIdentifier)
        }
      })
    }
  })
  return identifiers
}
