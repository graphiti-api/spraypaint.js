import { JSORMBase } from '../model';
import { JsonapiResourceIdentifier } from '../jsonapi-spec';
export default function (model: JSORMBase, relationNames: Array<string>): Record<string, JsonapiResourceIdentifier[]>;
