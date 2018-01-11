# What It Is

This library provides an interface to APIs following the JSONAPI spec. Though we're not striving for 1:1 compatibility with Active Record, you'll see it's the same basic usage, from scopes to error handling.

# How to Use It

### Defining Models

The first step is to define your models. These will match the [resource objects](http://jsonapi.org/format/#document-resource-objects) returned from your API. Your code can be written in Typescript, ES6, or vanilla JS/Coffeescript.

Let's say we have a `/api/v1/people` endpoint:

```js
// es6 import syntax
// vanilla JS would expose 'jsorm' as a global
import "isomorphic-fetch"
import { Model, attr } from "jsorm"

var Person = Model.extend({
  static: {
    baseUrl: "http://localhost:3000", // set to '' in browser for relative URLs
    apiNamespace: "/api/v1",
    jsonapiType: "people"
  },

  firstName: attr(),
  lastName: attr()
})
```

Alternatively, in Typescript:

```ts
// typescript
class Person extends Model {
  static baseUrl = "http://localhost:3000"
  static apiNamespace = "/api/v1"
  static jsonapiType = "people"

  firstName = attr()
  lastName = attr()
}
```

**NOTE**: \*Once your models are defined, you must call `Config.setup()`:

```js
import { Config } from "jsorm"
Config.setup()
```

### ES6/Typescript Classes

ES6 and TypeScript classes do not have an `inherited` hook. Because this hook provides critical functionality, you have three options:

* Edit your `.tsconfig`:

  * Set `target` to `es5`.
  * Add `noEmitHelpers: "true"`

* Call the inherited hook manually after each class definition:

  ```ts
  class Author extends Person { ... }
  Person.inherited(Author);
  ```

* Use the `let Person = Model.extend({ ... })` pattern shown above instead of native classes.

## Basic Usage

### Querying

All queries are

* Chainable
* Overrideable

Call `all()`, `first()`, or `find()` to actually fire the query.

All of the following examples can be chained together:

```js
let scope = new Person()
if (should_include_admins) {
  scope = scope.where({ admin: true })
}
scope.all().then(people => {
  people.data.map(p => {
    return p.firstName
  }) // => ['Joe', 'Jane', 'Bill']
})

scope
  .page(2)
  .all()
  .then(people => {
    people.data.map(p => {
      return p.firstName
    }) // => ['Chris', 'Sarah', 'Ben']
  })
```

### Pagination

[JSONAPI Pagination Docs](http://jsonapi.org/format/#fetching-pagination)

Use `per` and `page`. To limit 10 per page, viewing the second page:

```js
Person.per(10)
  .page(2)
  .all()
```

> GET /people?page[number]=2&page[size]=10

### Sorting

[JSONAPI Sorting Docs](http://jsonapi.org/format/#fetching-sorting)

Use `order`. Passing an attribute will default to ascending order.

Ascending:

```js
Person.order("name")
```

> GET /people?sort=name

Descending:

```js
Person.order({ name: "desc" })
```

> GET /people?sort=-name

### Filtering

[JSONAPI Filtering Docs](http://jsonapi.org/format/#fetching-filtering)

Use `where`:

```js
Person.where({ name: "Joe" })
  .where({ age: 30 })
  .all()
```

> GET /people?filter[name]=Joe&filter[age]=30

Filters are based on swagger documentation, not object attributes. This means you can do stuff like:

```js
Person.where({ age_greater_than: 30 }).all()
```

> GET /people?filter[age_greater_than]=30

Arrays are supported automatically, defaulting to an OR clause:

```js
Person.where({ name: ["Joe", "Bill"] }).all()
```

> GET /people?&filter[name][]=Joe&filter[name][]=Bill

### Sparse Fieldsets

[JSONAPI Sparse Fieldset Docs](http://jsonapi.org/format/#fetching-sparse-fieldsets)

Use `select`:

```js
Person.select({ people: ["name", "age"] }).all()
```

> GET /people?fields[people]=name,age

### Extra Fields

This functionality is enabled by [jsonapi_suite](https://jsonapi-suite.github.io/jsonapi_suite). It works the same as Sparse fieldsets, but is for requesting additional fields, not limiting them.

Use `selectExtra`:

```js
Person.selectExtra({ people: ["name", "age"] }).all()
```

> GET /people?extra_fields[people]=name,age

### Inclusion of Related Resources

[JSONAPI Docs on Includes (sideloads)](http://jsonapi.org/format/#fetching-includes)

Use `includes`. This can be a symbol, array, hash, or combination of all. In short - it works exactly like it works in ActiveRecord:

```js
// a person has many tags, and has many pets
// a pet has many toys, and many tags
Person.includes(["tags", { pets: ["toys", "tags"] }])
```

> GET /people?include=tags,pets.toys,pets.tags

The included resources will now be present:

```js
Person.includes("tags")
  .all()
  .then(person => {
    person.data.tags.map(t => {
      return t.name
    }) // #=> ['funny', 'smart']
  })
```

> GET /people?include=tags

### Basic Finders

`all`, `first`, and `find` can be used in conjunction with scopes.

```js
Person.all()
```

> GET /people

```js
scope = Person.where({ name: 'Bill' }) # no query
scope.all(); # => fires query, returns a Promise that resolves to an array of Person objects
```

> GET /people?filter[name]=bill

Use `first` to grab the first result:

```js
// Limits per_page to 1, result is first element in the array
Person.where({ name: "Bill" })
  .first()
  .then(person => {
    // ...
  })
```

> GET /people?page[size]=1&page[number]=1&filter[name]=Bill

Finally, use `find` to find a record by ID. This will hit the `show` action.

### Debugging

By default we will use `console` to log to STDOUT (or the browser's console log). If you are using node and want more in-depth options, inject another logger (we suggest [winston](https://github.com/winstonjs/winston)):

```js
import { Config } from "jsorm"
let winston = require("winston")

winston.level = "warn"
Config.logger = winston
```

This will log colorized request/responses when the log_level is debug, and only the request when the log level is info.

### Support or Contact

* Create a Github Issue
* Contact richmolj@gmail.com
