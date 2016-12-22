'use strict';

var _jsorm = require('../dist/jsorm');

var Person = _jsorm.Model.extend({
  myname: (0, _jsorm.attr)()
}); // babel example/foo.es6.js -o example/foo.js

var instance = new Person();
instance.myname = 'asdf';
console.log(instance.myname);
