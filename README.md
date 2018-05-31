# jsorm

This library provides an interface to APIs following the JSONAPI spec. Though we're not striving for 1:1 compatibility with Active Record, you'll see it's the same basic usage, from scopes to error handling.

Written in [Typescript](https://www.typescriptlang.org) but works in plain old ES5 as well. This library is isomorphic - use it from the browser, or from the server with NodeJS.

### Sample Usage

Please see [our documentation page](https://jsonapi-suite.github.io/jsonapi_suite/js/home) for full usage. Below is a Typescript sample:

```ts
import { JSORMBase, Model, Attr, HasMany } from "jsorm"

@Model()
class ApplicationRecord extends JSORMBase {
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
