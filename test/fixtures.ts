import { Model, Config, attr, hasMany, belongsTo, hasOne } from '../src/main';

// typescript class
class Person extends Model {
  static baseUrl = 'http://example.com';
  static apiNamespace = '/api';
  static endpoint = '/v1/people';

  static jsonapiType = 'people';

  firstName: string = attr();
  lastName: string = attr();
}

// plain js class
let Author = Person.extend({
  static: {
    jsonapiType: 'authors'
  },

  multiWords: hasMany('multi_words'),
  books:      hasMany(),
  tags:       hasMany(),
  genre:      belongsTo('genres'),
  bio:        hasOne('bios')
});

class Book extends Model {
  static jsonapiType = 'books';

  title: string = attr();
}

class Genre extends Model {
  static jsonapiType = 'genres';

  authors: any = hasMany('authors')

  name: string = attr();
}

class Bio extends Model {
  static jsonapiType = 'bios';

  description: string = attr()
}

class Tag extends Model {
  static jsonapiType = 'tags';

  name: string = attr()
}

class MultiWord extends Model {
  static jsonapiType = 'multi_words';
}

Config.setup();

export { Author, Person, Book, Genre, Bio, Tag };
