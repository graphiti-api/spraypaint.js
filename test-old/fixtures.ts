import { Model, Config, attr, hasMany, belongsTo, hasOne } from '../src/index';

class ApplicationRecord extends Model {
  static baseUrl = 'http://example.com';
  static apiNamespace = '/api';
}

// typescript class
class Person extends ApplicationRecord {
  static endpoint = '/v1/people';
  static jsonapiType = 'people';

  firstName: string = attr();
  lastName: string = attr();
}

class PersonWithExtraAttr extends Person {
  extraThing: string = attr({ persist: false });
}

class PersonWithoutCamelizedKeys extends Person {
  static camelizeKeys = false;

  first_name: string = attr();
}

// Ensure setup() can be run multiple times with no problems
// putting this here, otherwise relations wont be available.
Config.setup();

// plain js class
let Author = Person.extend({
  static: {
    endpoint: '/v1/authors',
    jsonapiType: 'authors'
  },

  nilly:        attr(),

  multiWords:   hasMany('multi_words'),
  specialBooks: hasMany('books'),
  books:        hasMany(),
  tags:         hasMany(),
  genre:        belongsTo('genres'),
  bio:          hasOne('bios')
});

let NonFictionAuthor = Author.extend({
  static: {
    endpoint: '/v1/non_fiction_authors',
    jsonapiType: 'non_fiction_authors',
    camelizeKeys: false
  },

  nilly:         attr(),

  multi_words:   hasMany('multi_words'),
  special_books: hasMany('books'),
  books:         hasMany(),
  tags:          hasMany(),
  genre:         belongsTo('genres'),
  bio:           hasOne('bios')
});

class Book extends ApplicationRecord {
  static jsonapiType = 'books';

  title: string = attr();

  genre = belongsTo('genres');
  author = hasOne('authors');
}

class Genre extends ApplicationRecord {
  static jsonapiType = 'genres';

  authors: any = hasMany('authors');

  name: string = attr();
}

class Bio extends ApplicationRecord {
  static jsonapiType = 'bios';

  description: string = attr();
}

class Tag extends ApplicationRecord {
  static jsonapiType = 'tags';

  name: string = attr();
}

class MultiWord extends ApplicationRecord {
  static jsonapiType = 'multi_words';
}

const TestJWTSubclass = ApplicationRecord.extend({});

const NonJWTOwner = Model.extend({});

const configSetup = function(opts = {}) {
  opts['jwtOwners'] = [ApplicationRecord, TestJWTSubclass];
  Config.setup(opts);
};
configSetup();

export {
  configSetup,
  ApplicationRecord,
  TestJWTSubclass,
  NonJWTOwner,
  Author,
  NonFictionAuthor,
  Person,
  PersonWithExtraAttr,
  PersonWithoutCamelizedKeys,
  Book,
  Genre,
  Bio,
  Tag
};
