/* tslint:disable */
import * as winston from "winston"
import * as es6Promise from "es6-promise"
import "isomorphic-fetch"
import * as sinon from "sinon"
import * as fetchMock from "fetch-mock"
import "mocha"

import { JSORMBase } from "../src/index"
import { config as envConfig } from "../src/util/env"
envConfig.productionTip = false

es6Promise.polyfill()

import * as chai from "chai"
const chaiThings = require("chai-things")
const sinonChai = require("sinon-chai")

// MUST be in this order
chai.use(chaiThings)
chai.use(sinonChai)

JSORMBase.logger = winston
JSORMBase.logger.level = "warn"

let expect = chai.expect

export { sinon, expect, fetchMock }
