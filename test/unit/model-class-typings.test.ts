import { expect } from '../test-helper'
import { JSORMBase, Model, Scope, attr } from '../../src/index'
import { WhereClause, SortScope, FieldScope, IncludeScope, StatsScope } from '../../src/scope'
import { RecordProxy } from '../../src/proxies/record-proxy'
import { CollectionProxy } from '../../src/proxies/collection-proxy'

/*
 *
 * This test file isn't going to assert anything. Instead,
 * it is going to be assigning strict typescript expectations
 * in order to verify that both typescript classes and
 * the `JSORMBase.extend()` apis expose the same static
 * class methods on their type definitions.  This will not
 * cause the tests to fail, but it will prevent the type
 * checks from succeeding.
 * 
 */
@Model()
class ClassBasedRoot extends JSORMBase {}

const ExtendBasedRoot = JSORMBase.extend({
  attrs: {
    stringProp: attr({type: String})
  }
})

describe('Model Class static attributes typings',() => {
  [
    { RootClass: ClassBasedRoot, name: 'Class-Based'},
    { RootClass: ExtendBasedRoot, name: 'extend()-Based'}
  ].forEach(({RootClass, name}) => { 
    describe(name, () => {
      describe('configuration options', () => {
        it('has the correct types', () => {
          let baseUrl : string = RootClass.baseUrl
          let apiNamespace : string = RootClass.apiNamespace
          let jsonapiType : string | undefined = RootClass.jsonapiType
          let endpoint : string = RootClass.endpoint
          let jwt : string | undefined = RootClass.jwt
          let jwtLocalStorage : string | false = RootClass.jwtLocalStorage
          let camelizeKeys : boolean = RootClass.camelizeKeys
          let strictAttributes : boolean = RootClass.strictAttributes
        })
      })

      const strEnum = <T extends string>(o : T[]) : {[K in T]: K} => {
        return o.reduce((res, key) => {
          res[key] = key
          return res
        }, Object.create(null))
      }

      describe('Scope delegators', () => {
        it('understands all of the scope delegator methods', () => {
          let page : (num : number) => Scope<typeof RootClass> = RootClass.page
          let per : (num : number) => Scope<typeof RootClass> = RootClass.per
          let where : (opts : WhereClause) => Scope<typeof RootClass> = RootClass.where
          let order : (opts : SortScope) => Scope<typeof RootClass> = RootClass.order
          let selectExtra : (opts : FieldScope) => Scope<typeof RootClass> = RootClass.select
          let includes : (opts : IncludeScope) => Scope<typeof RootClass> = RootClass.includes
          let merge : (opts : Record<string, Scope>) => Scope<typeof RootClass> = RootClass.merge
          let stats : (opts : StatsScope) => Scope<typeof RootClass> = RootClass.stats
        })

        it('understands the scope finder methods', () => {
          let first : () => Promise<RecordProxy<JSORMBase>> = RootClass.first
          let find : (id : string | number) => Promise<RecordProxy<JSORMBase>>
            = RootClass.find
          let all : () => Promise<CollectionProxy<JSORMBase>>
            = RootClass.all
          
          let result = new ExtendBasedRoot()

          result.stringProp = 'foo'
        })
      })
    })
  })
})