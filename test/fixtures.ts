import { Model, Config, attr, hasMany, belongsTo, hasOne } from '../src/main';

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

// plain js class
let Author = Person.extend({
  static: {
    jsonapiType: 'authors'
  },

  nilly:      attr(),

  multiWords: hasMany('multi_words'),
  books:      hasMany(),
  tags:       hasMany(),
  genre:      belongsTo('genres'),
  bio:        hasOne('bios')
});

class Book extends ApplicationRecord {
  static jsonapiType = 'books';

  title: string = attr();
}

class Genre extends ApplicationRecord {
  static jsonapiType = 'genres';

  authors: any = hasMany('authors')

  name: string = attr();
}

class Bio extends ApplicationRecord {
  static jsonapiType = 'bios';

  description: string = attr()
}

class Tag extends ApplicationRecord {
  static jsonapiType = 'tags';

  name: string = attr()
}

class MultiWord extends ApplicationRecord {
  static jsonapiType = 'multi_words';
}

const TestJWTSubclass = ApplicationRecord.extend({
});

Config.setup({ jwtOwners: [ApplicationRecord, TestJWTSubclass] });

export { ApplicationRecord, TestJWTSubclass, Author, Person, Book, Genre, Bio, Tag };
