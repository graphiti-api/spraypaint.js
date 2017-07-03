# jsorm

This library provides an interface to APIs following the JSONAPI spec. Though we're not striving for 1:1 compatibility with Active Record, you'll see it's the same basic usage, from scopes to error handling.

Written in [Typescript](https://www.typescriptlang.org) and distributed in ES5, this library is isomorphic - use it from the browser, or from node.

(Open to better names for this lib :grin:)

### Sample Usage

Please see [our documentation page](https://jsonapi-suite.github.io/jsorm/) for full usage.

```es6
import 'isomorphic-fetch';
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

Config.setup();

Person.where({ name: 'Joe' }).page(2).per(10).sort('name').then((people) => {
  let names = people.map((p) => { return p.fullName(); });
  console.log(names); // ['Joe Blow', 'Joe DiMaggio', ...]
});
```

### JSON Web Tokens

jsorm supports setting a JWT and using it for all requests. Set it
during `Config.setup` and all subsequents will pass it using the
`Authorization` header:

```es6
const ApplicationRecord = Model.extend({
  // code
});

const Person = ApplicationRecord.extend({
  // code
});

const Author = ApplicationRecord.extend({
  // code
});

Config.setup({ jwtOwners: [ApplicationRecord] });

ApplicationRecord.jwt = 's0m3t0k3n';
Author.all(); // sends JWT in Authorization header
Author.getJWT(); // grabs from ApplicationRecord
Author.setJWT('t0k3n'); // sets on ApplicationRecord
```

This means you could define `OtherApplicationRecord`, whose
subclasses could use an alternate JWT for an alternate website.

The token is sent in the following format:

```
Authorization: Token token="s0m3t0k3n"
```

If your application responds with `X-JWT` in the headers, jsorm will
use this JWT for all subsequent requests (helpful when
implementing token expiry).

### Roadmap

* Attribute transforms (type coercion)
* Improved Error / Validation handling
