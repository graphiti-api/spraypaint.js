// Build a hash like
// {
//   posts: [{id: 1, type: 'posts'}],
//   category: [{id: 1, type: 'categories}]
// }
// Will be array regardless of relationship type
// This will only contain persisted objects
// Used for dirty tracking associations
export default function (model, relationNames) {
    var identifiers = {};
    relationNames.forEach(function (relationName) {
        var relatedObjects = model.relationship(relationName);
        if (relatedObjects) {
            if (!Array.isArray(relatedObjects))
                relatedObjects = [relatedObjects];
            relatedObjects.forEach(function (r) {
                if (r.isPersisted) {
                    if (!identifiers[relationName]) {
                        identifiers[relationName] = [];
                    }
                    identifiers[relationName].push(r.resourceIdentifier);
                }
            });
        }
    });
    return identifiers;
}
//# sourceMappingURL=relationship-identifiers.js.map