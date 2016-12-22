import { Model, Config, attr, hasMany, belongsTo } from '../src/main';

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
  },

  books: hasMany(),
  genre: belongsTo()
});

class Book extends Model {
  static jsonapiType = 'books';

  title: string = attr();
}

class Genre extends Model {
  static jsonapiType = 'genres';

  authors: any = hasMany()

  name: string = attr();
}

Config.bootstrap();

export { Author, Person, Book, Genre };
