import {
  SpraypaintBase,
  Model,
  attr,
  hasMany,
  belongsTo,
  hasOne
} from "../src/index"

import { Attr, BelongsTo, HasMany, HasOne, Link } from "../src/decorators"
import { DirtyChecker } from "../src/attribute"

@Model({
  baseUrl: "http://example.com",
  apiNamespace: "/api"
})
export class ApplicationRecord extends SpraypaintBase {}

@Model()
export class Person extends ApplicationRecord {
  static endpoint = "/v1/people"
  static jsonapiType = "people"

  @Attr firstName!: string | null
  @Attr lastName!: string | null
  @Attr({ type: Number }) age!: number | null
  @BelongsTo({ type: "person_details" }) personDetail!: PersonDetail
}

@Model()
export class PersonWithExtraAttr extends Person {
  @Attr({ persist: false }) extraThing!: string
}

@Model()
export class PersonWithLinks extends Person {
  static endpoint = "/v1/people_with_links"
  static jsonapiType = "people_with_links"

  @Link() self!: string
  @Link() webView!: string
}

export interface Coordinates {
  lon: number
  lat: number
}

const dirtyCoordinatesChecker: DirtyChecker<Coordinates> = (
  prior: Coordinates,
  current: Coordinates
) => prior.lon !== current.lon || prior.lat !== current.lat

@Model()
export class PersonDetail extends ApplicationRecord {
  static jsonapiType = "person_details"

  @Attr address!: string
  @Attr({ dirtyChecker: dirtyCoordinatesChecker })
  coordinates!: Coordinates | null
}

@Model({ keyCase: { server: "snake", client: "snake" } })
export class PersonWithoutCamelizedKeys extends Person {
  @Attr first_name!: string
}

@Model({ keyCase: { server: "dash", client: "camel" } })
export class PersonWithDasherizedKeys extends Person {}

@Model({
  endpoint: "/v1/authors",
  jsonapiType: "authors"
})
export class Author extends Person {
  @Attr nilly!: string
  @HasMany({ type: "multi_words" }) multiWords!: MultiWord[]
  @HasMany("books") specialBooks!: Book[]
  @HasMany() books!: Book[]
  @HasMany() tags!: Tag[]
  @BelongsTo({ type: "genres" }) genre!: Genre
  @HasOne("bios") bio!: Bio
}

@Model()
export class Book extends ApplicationRecord {
  static jsonapiType = "books"

  @Attr title!: string

  @BelongsTo({ type: "genres" })
  genre!: Genre
  @HasOne({ type: Author })
  author: any
}

export const NonFictionAuthor = Author.extend({
  static: {
    endpoint: "/v1/non_fiction_authors",
    jsonapiType: "non_fiction_authors",
    keyCase: { server: "snake", client: "snake" }
  },

  attrs: {
    nilly: attr(),

    multi_words: hasMany("multi_words"),
    special_books: hasMany({ type: Book }),
    books: hasMany(),
    tags: hasMany(),
    genre: belongsTo({ type: "genres" }),
    bio: hasOne({ type: "bios" })
  }
})

@Model()
export class Genre extends ApplicationRecord {
  static jsonapiType = "genres"

  @Attr name!: string
  @HasMany("authors") authors: any
}

@Model()
export class Bio extends ApplicationRecord {
  static jsonapiType = "bios"

  @Attr description!: string
}

@Model()
export class Tag extends ApplicationRecord {
  static jsonapiType = "tags"

  @Attr name!: string
}

@Model()
export class MultiWord extends ApplicationRecord {
  static jsonapiType = "multi_words"
}

@Model()
export class BackgroundJob extends ApplicationRecord {
  static jsonapiType = "background_jobs"
}

export const TestJWTSubclass = ApplicationRecord.extend({})

export const NonJWTOwner = SpraypaintBase.extend({})
