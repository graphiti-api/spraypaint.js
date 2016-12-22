import { Model, Config, attr } from '../src/main';

// typescript class
class Person extends Model {
  static baseUrl = 'http://example.com';
  static apiNamespace = '/api';
  static endpoint = '/v1/people';

  static jsonapiType = 'people';

  name: string = attr();
}

// plain js class
let Author = Person.extend({
  static: {
    jsonapiType: 'authors'
  }
});

Config.bootstrap();

export { Author, Person };
