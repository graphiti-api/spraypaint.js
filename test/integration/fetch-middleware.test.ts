import { expect, sinon, fetchMock } from '../test-helper';
import { Author, ApplicationRecord } from '../fixtures';
import { MiddlewareStack, BeforeFilter, AfterFilter } from '../../src/middleware-stack'

const mock401 = function() {
  fetchMock.restore();

  fetchMock.mock({
    matcher: '*',
    response: {
      status: 401,
      body: {
        errors: [
          {
            code: 'unauthenticated',
            status: '401',
            title: 'Authentication Error',
            detail: 'You must sign in to access this resource',
            meta: { }
          }
        ]
      }
    }
  })
}

const mockBadJSON = function() {
  fetchMock.restore();

  fetchMock.mock({
    matcher: '*',
    response: {
      status: 500,
      body: undefined
    }
  })
}

const mock500 = function() {
  fetchMock.restore();

  fetchMock.mock({
    matcher: '*',
    response: {
      status: 500,
      body: {
        errors: []
      }
    }
  })
}

const mockSuccess = function() {
  fetchMock.restore();

  fetchMock.mock({
    matcher: '*',
    response: {
      status: 200,
      body: {
        data: []
      }
    }
  })
}


let before = {} as any
let after = {} as any
describe('fetch middleware', function() {
  let oldStack = ApplicationRecord.middlewareStack

  beforeEach(function () {
    mockSuccess();

    let middleware = new MiddlewareStack()

    middleware.beforeFilters.push(function(url, options) {
      before = { url, options }

      // Author.first, or saving author with name 'abortme'
      // should abort
      let shouldAbort = false
      if (url.indexOf('page') > -1) shouldAbort = true
      if (options.body && options.body.indexOf('abortme') > -1) {
        shouldAbort = true
      }

      if (shouldAbort) {
        throw('abort')
      }
    })

    middleware.afterFilters.push(function(response, json) {
      after = { response, json }

      if (response.status == 401) {
        throw('abort')
      }
    })

    ApplicationRecord.middlewareStack = middleware
  });

  afterEach(function() {
    fetchMock.restore()
    ApplicationRecord.middlewareStack = oldStack
    before = {}
    after = {}
  })

  describe('reads', function() {
    describe('on successful response', function() {
      it('correctly resolves the promise', async function() {
        let { data } = await Author.all()

        expect(data).to.deep.eq([])
      })

      it('runs beforeEach hooks', function() {
        return Author.all().then(({data}) => {
          expect(before.url).to.eq('http://example.com/api/v1/authors')
          expect(before.options).to.deep.eq({
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            method: 'GET'
          })
        })
      })

      it('runs afterEach hooks', function() {
        return Author.all().then(({data}) => {
          expect(after.response.status).to.eq(200)
        })
      })
    })

    describe('when beforeFetch middleware aborts', function() {
      beforeEach(function() {
        mockSuccess()
      })

      it('rejects the promise w/correct RequestError class', function() {
        return Author.first().then(({data}) => {
          expect('dont get here!').to.eq(true)
        })
        .catch((e) => {
          expect(e.message).to
            .eq('beforeFetch failed; review middleware.beforeFetch stack')
          expect(e.originalError).to.eq('abort')
          expect(e.url).to.eq('http://example.com/api/v1/authors?page[size]=1')
        })
      })
    })

    describe('when afterFetch middleware aborts', function() {
      beforeEach(function() {
        mock401()
      })

      it('rejects the promise w/correct ResponseError class', function() {
        return Author.all().then(({data}) => {
          expect('dont get here!').to.eq(true)
        })
        .catch((e) => {
          expect(e.message).to
            .eq('afterFetch failed; review middleware.afterFetch stack')
          expect(e.response.status).to.eq(401)
          expect(e.originalError).to.eq('abort')
        })
      })
    })

    describe('on 500 response', function() {
      beforeEach(function() {
        mock500()
      })

      it('rejects the promise with the response', function() {
        return Author.all().then(({data}) => {
          expect('dont get here!').to.eq(true)
        })
        .catch((e) => {
          expect(e.response.statusText).to.eq('Internal Server Error')
        })
      })
    })

    describe('on bad json response', function() {
      beforeEach(function() {
        mockBadJSON()
      })

      it('rejects the promise with original error', function() {
        return Author.all().then(({data}) => {
          expect('dont get here!').to.eq(true)
        })
        .catch((e) => {
          expect(e.response.statusText).to.eq('Internal Server Error')
          expect(e.originalError.message)
            .to.match(/Unexpected end of JSON input/)
        })
      })
    })

    describe('when the model overrides the hooks', function() {
      let originalBeforeFetch : BeforeFilter | undefined;
      let originalAfterFetch : AfterFilter | undefined;

      beforeEach(function() {
        originalBeforeFetch = Author.beforeFetch
        originalAfterFetch = Author.afterFetch

        Author.beforeFetch = function(url, options) {
          before.overridden = true
        }

        Author.afterFetch = function(url, options) {
          after.overridden = true
        }
      })

      afterEach(function() {
        Author.beforeFetch = originalBeforeFetch
        Author.afterFetch = originalAfterFetch
      })

      it('uses the override', async function() {
        let a = Author
        await Author.all()

        expect(before).to.deep.eq({ overridden: true })
        expect(after).to.deep.eq({ overridden: true })
      })
    })
  })

  describe('writes', function() {
    describe('on successful response', function() {
      it('correctly resolves the promise', function() {
        let author = new Author()
        return author.save().then((success) => {
          expect(success).to.eq(true)
        })
      })

      it('runs beforeEach hooks', function() {
        let author = new Author()
        return author.save().then(() => {
          expect(before.url).to.eq('http://example.com/api/v1/authors')
          expect(before.options).to.deep.eq({
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: { type: 'authors' } }),
            method: 'POST'
          })
        })
      })

      it('runs afterEach hooks', function() {
        let author = new Author()
        return author.save().then(() => {
          expect(after.response.status).to.eq(200)
        })
      })
    })

    describe('when beforeFetch middleware aborts', function() {
      it('rejects the promise w/correct RequestError class', function() {
        let author = new Author({ firstName: 'abortme' })
        return author.save().then(() => {
          expect('dont get here!').to.eq(true)
        })
        .catch((e) => {
          expect(e.message).to
            .eq('beforeFetch failed; review middleware.beforeFetch stack')
          expect(e.originalError).to.eq('abort')
          expect(e.url).to.eq('http://example.com/api/v1/authors')
        })
      })
    })

    describe('when afterFetch middleware aborts', function() {
      beforeEach(function() {
        mock401()
      })

      it('rejects the promise w/correct ResponseError class', function() {
        let author = new Author()
        return author.save().then(() => {
          expect('dont get here!').to.eq(true)
        })
        .catch((e) => {
          expect(e.message).to
            .eq('afterFetch failed; review middleware.afterFetch stack')
          expect(e.response.status).to.eq(401)
          expect(e.originalError).to.eq('abort')
        })
      })
    })

    describe('on 500 response', function() {
      beforeEach(function() {
        mock500()
      })

      it('rejects the promise with the response', function() {
        let author = new Author()
        return author.save().then(() => {
          expect('dont get here!').to.eq(true)
        })
        .catch((e) => {
          expect(e.response.statusText).to.eq('Internal Server Error')
        })
      })
    })

    describe('on bad json response', function() {
      beforeEach(function() {
        mockBadJSON()
      })

      it('rejects the promise with original error', function() {
        let author = new Author()
        return author.save().then(() => {
          expect('dont get here!').to.eq(true)
        })
        .catch((e) => {
          expect(e.response.statusText).to.eq('Internal Server Error')
          expect(e.originalError.message)
            .to.match(/Unexpected end of JSON input/)
        })
      })
    })

    describe('when the model overrides the hooks', function() {
      let originalBeforeFetch : BeforeFilter | undefined
      let originalAfterFetch : AfterFilter | undefined

      beforeEach(function() {
        originalBeforeFetch = Author.beforeFetch
        originalAfterFetch = Author.afterFetch

        Author.beforeFetch = function(url, options) {
          before.overridden = true
        }

        Author.afterFetch = function(url, options) {
          after.overridden = true
        }
      })

      afterEach(function() {
        Author.beforeFetch = originalBeforeFetch
        Author.afterFetch = originalAfterFetch
      })

      it('uses the override', async function() {
        let author = new Author()

        await author.save()

        expect(before).to.deep.eq({ overridden: true })
        expect(after).to.deep.eq({ overridden: true })
      })
    })
  })
})
