# jsorm

This library provides an interface to APIs following the JSONAPI spec. Though we're not striving for 1:1 compatibility with Active Record, you'll see it's the same basic usage, from scopes to error handling.

Written in [Typescript](https://www.typescriptlang.org) and distributed in ES5, this library is isomorphic - use it from the browser, or from node.

(Open to better names for this lib :grin:)

### Sample Usage

Please see [our documentation page](https://bbgithub.dev.bloomberg.com/pages/lrichmon/jsorm) for full usage.

```es6
import { Config, Model, attr, hasMany, belongsTo } from 'jsorm';

const Person = Model.extend({
  static {
    baseUrl: 'http://localhost:3000',
    jsonapiType: 'people'
  },
  
  firstName: attr(),
  lastName: attr(),
  fullName() {
    return this.firstName + ' ' + this.lastName;
  }
});

Person.where({ name: 'Joe' }).page(2).per(10).sort('name').then((people) => {
  let names = people.map((p) => { return p.fullName(); });
  console.log(names); // ['Joe Blow', 'Joe DiMaggio', ...]
});
```

### Roadmap

* Find to throw error when record not found
* Authentication from Node
* Attribute transforms (type coercion)
* Writes
* Error / Validation handling
* Nested Writes
* Statistics
