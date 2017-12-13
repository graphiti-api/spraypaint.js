"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Build a hash like
// {
//   posts: [{id: 1, type: 'posts'}],
//   category: [{id: 1, type: 'categories}]
// }
// Will be array regardless of relationship type
// This will only contain persisted objects
// Used for dirty tracking associations
function default_1(model, relationNames) {
    var identifiers = {};
    relationNames.forEach(function (relationName) {
        var relatedObjects = model.relationships[relationName];
        if (relatedObjects) {
            if (!Array.isArray(relatedObjects))
                relatedObjects = [relatedObjects];
            relatedObjects.forEach(function (r) {
                if (r.isPersisted()) {
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
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsYXRpb25zaGlwLWlkZW50aWZpZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWwvcmVsYXRpb25zaGlwLWlkZW50aWZpZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsb0JBQW9CO0FBQ3BCLElBQUk7QUFDSixxQ0FBcUM7QUFDckMsMkNBQTJDO0FBQzNDLElBQUk7QUFDSixnREFBZ0Q7QUFDaEQsMkNBQTJDO0FBQzNDLHVDQUF1QztBQUN2QyxtQkFBd0IsS0FBWSxFQUFFLGFBQTRCO0lBQ2hFLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUNyQixhQUFhLENBQUMsT0FBTyxDQUFDLFVBQUMsWUFBWTtRQUNqQyxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3ZELEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUFDLGNBQWMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3RFLGNBQWMsQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDO2dCQUN2QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNwQixFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQy9CLFdBQVcsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQ2pDLENBQUM7b0JBQ0QsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDdkQsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLFdBQVcsQ0FBQztBQUNyQixDQUFDO0FBakJELDRCQWlCQyJ9