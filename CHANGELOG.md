# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 1.1.0 [2018-03-28]
### Changed
- Remove intermediate JWT storage. Instead of syncing to the provided credential storage
  backend, it will always use the specified backend directly.

## 1.0.0 [2018-02-19]
### Added
- Major overhaul of the codebase
- Much better typescript experience
- Decorator-based API for typescript classes
- Model data syncing features
- Serialization and deserialization property casing now configurable

### Breaking
- All breaking changes from 0.x.x captured in [this test file](https://github.com/jsonapi-suite/jsorm/blob/v1.0.2/test/backwards-breaking-test.ts)
