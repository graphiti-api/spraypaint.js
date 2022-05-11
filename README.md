# Spraypaint

JS Client for [Graphiti](https://graphiti-api.github.io/graphiti) similar to ActiveRecord.

Written in [Typescript](https://www.typescriptlang.org) but works in plain old ES5 as well. This library is isomorphic - use it from the browser, or from the server with NodeJS.

### Sample Usage

Please see [our documentation page](https://graphiti-api.github.io/graphiti/js) for full usage. Below is a Typescript sample:

```ts
import { SpraypaintBase, Model, Attr, HasMany } from "spraypaint"

@Model()
class ApplicationRecord extends SpraypaintBase {
  static baseUrl = "http://localhost:3000"
  static apiNamespace = "/api/v1"
}

@Model()
class Person extends ApplicationRecord {
  static jsonapiType = "people"

  @Attr() firstName: string
  @Attr() lastName: string

  @HasMany() pets: Pet[]

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}

@Model()
class Pet extends ApplicationRecord {
  static jsonapiType = "pets"

  @Attr() name: string
}

let { data } = await Person
  .where({ name: 'Joe' })
  .page(2).per(10)
  .sort('name')
  .includes("pets")
  .all()

let names = data.map((p) => { return p.fullName })
console.log(names) // ['Joe Blow', 'Joe DiMaggio', ...]

console.log(data[0].pets[0].name) // "Fido"
```
