// babel example/foo.es6.js -o example/foo.js

import { Model, attr } from '../dist/jsorm';

const Person = Model.extend({
  myname: attr()
})

let instance = new Person();
instance.myname = 'asdf';
console.log(instance.myname);
