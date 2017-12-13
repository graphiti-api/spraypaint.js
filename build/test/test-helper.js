"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston = require("winston");
var es6Promise = require("es6-promise");
require("isomorphic-fetch");
var sinon = require("sinon");
exports.sinon = sinon;
var fetchMock = require("fetch-mock");
exports.fetchMock = fetchMock;
require("mocha");
es6Promise.polyfill();
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var chaiThings = require("chai-things");
var index_1 = require("../src/index");
winston.level = 'warn';
index_1.Config.logger = winston;
// MUST be in this order
chai.use(chaiThings);
chai.use(chaiAsPromised);
var expect = chai.expect;
exports.expect = expect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1oZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90ZXN0L3Rlc3QtaGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQW1DO0FBQ25DLHdDQUEwQztBQUMxQyw0QkFBMEI7QUFDMUIsNkJBQStCO0FBb0J0QixzQkFBSztBQW5CZCxzQ0FBd0M7QUFtQmhCLDhCQUFTO0FBbEJqQyxpQkFBZTtBQUNmLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUV0QiwyQkFBNkI7QUFDN0IsaURBQW1EO0FBQ25ELHdDQUEyQztBQUUzQyxzQ0FBc0M7QUFFdEMsT0FBTyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7QUFDdkIsY0FBTSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7QUFFeEIsd0JBQXdCO0FBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUV6QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBRVQsd0JBQU0ifQ==