import { expect } from "../test-helper"
import { SpraypaintBase, Model, Scope, attr } from "../../src/index"
import { KeyCase } from "../../src/model"
import {
  WhereClause,
  SortScope,
  FieldScope,
  FieldArg,
  IncludeScope,
  StatsScope
} from "../../src/scope"
import { NullProxy, CollectionProxy, RecordProxy } from "../../src/proxies"

/*
 *
 * This test file isn't going to assert anything. Instead,
 * it is going to be assigning strict typescript expectations
 * in order to verify that both typescript classes and
 * the `SpraypaintBase.extend()` apis expose the same static
 * class methods on their type definitions.  This will not
 * cause the tests to fail, but it will prevent the type
 * checks from succeeding.
 *
 */
@Model()
class ClassBasedRoot extends SpraypaintBase {}

const ExtendBasedRoot = SpraypaintBase.extend({
  attrs: {
    stringProp: attr({ type: String })
  }
})

describe("Model Class static attributes typings", () => {
  describe("Class-Based", () => {
    describe("configuration options", () => {
      it("has the correct types", () => {
        const baseUrl: string = ClassBasedRoot.baseUrl
        const apiNamespace: string = ClassBasedRoot.apiNamespace
        const jsonapiType: string | undefined = ClassBasedRoot.jsonapiType
        const endpoint: string = ClassBasedRoot.endpoint
        const jwt: string | undefined = ClassBasedRoot.jwt
        const keyCase: KeyCase = ClassBasedRoot.keyCase
        const strictAttributes: boolean = ClassBasedRoot.strictAttributes
      })
    })

    const strEnum = <T extends string>(o: T[]): { [K in T]: K } => {
      return o.reduce((res, key) => {
        res[key] = key
        return res
      }, Object.create(null))
    }

    describe("Scope delegators", () => {
      it("understands all of the scope delegator methods", () => {
        const page: (num: number) => Scope<ClassBasedRoot> = ClassBasedRoot.page
        const per: (num: number) => Scope<ClassBasedRoot> = ClassBasedRoot.per
        const where: (opts: WhereClause) => Scope<ClassBasedRoot> =
          ClassBasedRoot.where
        const order: (opts: SortScope) => Scope<ClassBasedRoot> =
          ClassBasedRoot.order
        const select: (opts: FieldArg) => Scope<ClassBasedRoot> =
          ClassBasedRoot.select
        const selectExtra: (opts: FieldArg) => Scope<ClassBasedRoot> =
          ClassBasedRoot.selectExtra
        const includes: (opts: IncludeScope) => Scope<ClassBasedRoot> =
          ClassBasedRoot.includes
        const merge: (opts: Record<string, Scope>) => Scope<ClassBasedRoot> =
          ClassBasedRoot.merge
        const stats: (opts: StatsScope) => Scope<ClassBasedRoot> =
          ClassBasedRoot.stats
      })

      it("understands the scope finder methods", () => {
        const first: () => Promise<RecordProxy<SpraypaintBase> | NullProxy> =
          ClassBasedRoot.first
        const find: (
          id: string | number
        ) => Promise<RecordProxy<SpraypaintBase>> = ClassBasedRoot.find
        const all: () => Promise<CollectionProxy<SpraypaintBase>> =
          ClassBasedRoot.all

        const result = new ExtendBasedRoot()

        result.stringProp = "foo"
      })
    })
  })

  describe("extend()-Based", () => {
    describe("configuration options", () => {
      it("has the correct types", () => {
        const baseUrl: string = ExtendBasedRoot.baseUrl
        const apiNamespace: string = ExtendBasedRoot.apiNamespace
        const jsonapiType: string | undefined = ExtendBasedRoot.jsonapiType
        const endpoint: string = ExtendBasedRoot.endpoint
        const jwt: string | undefined = ExtendBasedRoot.jwt
        const keyCase: KeyCase = ExtendBasedRoot.keyCase
        const strictAttributes: boolean = ExtendBasedRoot.strictAttributes
      })
    })

    const strEnum = <T extends string>(o: T[]): { [K in T]: K } => {
      return o.reduce((res, key) => {
        res[key] = key
        return res
      }, Object.create(null))
    }

    describe("Scope delegators", () => {
      it("understands all of the scope delegator methods", () => {
        const page: (num: number) => Scope = ExtendBasedRoot.page
        const per: (num: number) => Scope = ExtendBasedRoot.per
        const where: (opts: WhereClause) => Scope = ExtendBasedRoot.where
        const order: (opts: SortScope) => Scope = ExtendBasedRoot.order
        const select: (opts: FieldArg) => Scope = ExtendBasedRoot.select
        const selectExtra: (opts: FieldArg) => Scope =
          ExtendBasedRoot.selectExtra
        const includes: (opts: IncludeScope) => Scope = ExtendBasedRoot.includes
        const merge: (opts: Record<string, Scope>) => Scope =
          ExtendBasedRoot.merge
        const stats: (opts: StatsScope) => Scope = ExtendBasedRoot.stats
      })

      it("understands the scope finder methods", () => {
        const first: () => Promise<RecordProxy<SpraypaintBase> | NullProxy> =
          ExtendBasedRoot.first
        const find: (
          id: string | number
        ) => Promise<RecordProxy<SpraypaintBase>> = ExtendBasedRoot.find
        const all: () => Promise<CollectionProxy<SpraypaintBase>> =
          ExtendBasedRoot.all

        const result = new ExtendBasedRoot()

        result.stringProp = "foo"
      })
    })
  })
})
