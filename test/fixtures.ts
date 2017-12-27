import { 
  JSORMBase, 
  Model, 
  ModelConstructor, 
  Config, 
  attr, 
  hasMany, 
  belongsTo, 
  hasOne 
} from '../src/index';

import { 
  Attr,
  BelongsTo,
  HasMany,
  HasOne,
} from '../src/decorators'

@Model({
  baseUrl: 'http://example.com',
  apiNamespace: '/api'
})
export class ApplicationRecord extends JSORMBase {
}

@Model()
export class Person extends ApplicationRecord {
  static endpoint = '/v1/people';
  static jsonapiType = 'people';

  @Attr firstName : string
  @Attr lastName : string
}

@Model()
export class PersonWithExtraAttr extends Person {
  @Attr({persist: false}) extraThing: string;
}

@Model({camelizeKeys: false})
export class PersonWithoutCamelizedKeys extends Person {
  @Attr first_name: string
}

// Ensure setup() can be run multiple times with no problems
// putting this here, otherwise relations wont be available.
// Config.setup();
export const Author = Person.extend({
  config: {
    endpoint: '/v1/authors',
    jsonapiType: 'authors'
  },

  attrs: {
    nilly:        attr(),
    multiWords:   hasMany({type: MultiWord}),
    specialBooks: hasMany({type: Book}),
    books:        hasMany(),
    tags:         hasMany(),
    genre:        belongsTo({type: Genre}),
    bio:          hasOne({type: Bio})
  }
})

export const NonFictionAuthor = Author.extend({
  static: {
    endpoint: '/v1/non_fiction_authors',
    jsonapiType: 'non_fiction_authors',
    camelizeKeys: false
  },

  attrs: {
    nilly:         attr(),

    multi_words:   hasMany({type: MultiWord}),
    special_books: hasMany({type: Book}),
    books:         hasMany(),
    tags:          hasMany(),
    genre:         belongsTo({type: Genre}),
    bio:           hasOne({type: Bio})
  }
});

@Model()
export class Book extends ApplicationRecord {
  static jsonapiType = 'books';

  @Attr title: string

  @BelongsTo({type: Genre}) genre : Genre
  @HasOne({type: Author}) author : any
}

@Model()
export class Genre extends ApplicationRecord {
  static jsonapiType = 'genres';

  @Attr name : string 
  @HasMany('authors') authors: any
}

@Model()
export class Bio extends ApplicationRecord {
  static jsonapiType = 'bios';

  @Attr description : string 
}

@Model()
export class Tag extends ApplicationRecord {
  static jsonapiType = 'tags';

  @Attr name: string 
}

@Model()
export class MultiWord extends ApplicationRecord {
  static jsonapiType = 'multi_words';
}

const TestJWTSubclass = ApplicationRecord.extend({});

const NonJWTOwner = JSORMBase.extend({});

// const configSetup = function(opts = {}) {
//   opts['jwtOwners'] = [ApplicationRecord, TestJWTSubclass];
//   Config.setup(opts);
// };
// configSetup();

// export {
//   configSetup,
//   ApplicationRecord,
//   TestJWTSubclass,
//   NonJWTOwner,
//   Author,
//   NonFictionAuthor,
//   Person,
//   PersonWithExtraAttr,
//   PersonWithoutCamelizedKeys,
//   Book,
//   Genre,
//   Bio,
//   Tag
// };
