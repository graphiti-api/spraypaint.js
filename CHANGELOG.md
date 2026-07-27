## [0.11.0](https://github.com/graphiti-api/spraypaint.js/compare/v0.10.25...v0.11.0) (2026-07-27)

### Features

* add support for constructor assignment for collections ([#109](https://github.com/graphiti-api/spraypaint.js/issues/109)) ([36a223a](https://github.com/graphiti-api/spraypaint.js/commit/36a223a5c462ba0c705fd54c2f1e3b21098e55c7))
* middleware.afterFilters can now set a newResponse to use (permit retry or re-rerouting request) ([#100](https://github.com/graphiti-api/spraypaint.js/issues/100)) ([5970ad9](https://github.com/graphiti-api/spraypaint.js/commit/5970ad91454b3f70b9a3f8135c100df1a6af7e78))
* singular Resource Handling (read/write operations) ([#98](https://github.com/graphiti-api/spraypaint.js/issues/98)) ([0f0ec91](https://github.com/graphiti-api/spraypaint.js/commit/0f0ec91752d062b598daf8160dc6393af7b24144))

### Bug Fixes

* declare type definitions on EventBus ([#75](https://github.com/graphiti-api/spraypaint.js/issues/75)) ([7074b1d](https://github.com/graphiti-api/spraypaint.js/commit/7074b1d5e6b7bcd804a327f0707ca6cbfeba689e)), closes [#54](https://github.com/graphiti-api/spraypaint.js/issues/54)
* don't skip afterFetch in cases where there's no response body. ([#35](https://github.com/graphiti-api/spraypaint.js/issues/35)) ([db52073](https://github.com/graphiti-api/spraypaint.js/commit/db520732fcba0b77a3f9db07da8ccda989915112))
* encode query parameters regardless of the browser ([#104](https://github.com/graphiti-api/spraypaint.js/issues/104)) ([e964909](https://github.com/graphiti-api/spraypaint.js/commit/e96490904d55e254ae1645767c7a691ecf35b531))
* remove all marked-for-destruction relations, not every other one ([#137](https://github.com/graphiti-api/spraypaint.js/issues/137)) ([f3dcbe6](https://github.com/graphiti-api/spraypaint.js/commit/f3dcbe6f8886b0129e0238433108aeec8b00ffe6)), closes [#63](https://github.com/graphiti-api/spraypaint.js/issues/63)
* self referential relationships will not longer silently fail ([dd2247e](https://github.com/graphiti-api/spraypaint.js/commit/dd2247eb618d9e8ac6281633d7c766e6f8fa9349)), closes [#110](https://github.com/graphiti-api/spraypaint.js/issues/110)
* validation error when relationship has nested records ([#101](https://github.com/graphiti-api/spraypaint.js/issues/101)) ([abf6b5d](https://github.com/graphiti-api/spraypaint.js/commit/abf6b5d3bf363eb2e42ae1e09a73bd86c4eedd9c))

## [0.10.25](https://github.com/graphiti-api/spraypaint.js/compare/v0.10.24...v0.10.25) (2026-07-27)

### Bug Fixes

* copy original attributes when duplicating a record ([#86](https://github.com/graphiti-api/spraypaint.js/issues/86)) ([eccbf12](https://github.com/graphiti-api/spraypaint.js/commit/eccbf121747fb518b67557939d126fe10e2c55bf))
* test [#all](https://github.com/graphiti-api/spraypaint.js/issues/all)() when browser is IE ([b23722c](https://github.com/graphiti-api/spraypaint.js/commit/b23722cc214438587d87bad14e8aebc061449835))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
