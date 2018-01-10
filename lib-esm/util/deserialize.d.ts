import { JsonapiTypeRegistry } from '../jsonapi-type-registry';
import { JSORMBase } from '../model';
import { IncludeScopeHash } from './include-directive';
import { JsonapiResource, JsonapiResponseDoc } from '../jsonapi-spec';
declare function deserialize(registry: JsonapiTypeRegistry, datum: JsonapiResource, payload: JsonapiResponseDoc): JSORMBase;
declare function deserializeInstance(instance: JSORMBase, resource: JsonapiResource, payload: JsonapiResponseDoc, includeDirective?: IncludeScopeHash): JSORMBase;
export { deserialize, deserializeInstance };
