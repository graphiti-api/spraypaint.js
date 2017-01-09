const gulp    = require('gulp');
const mocha   = require('gulp-mocha');
const webpack = require('webpack-stream');
const ts      = require('gulp-typescript');
const del     = require('del');
const watch   = require('gulp-watch');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('clean:test', function () {
  return del(['tmp/test']);
});

gulp.task('test', ['clean:test'], () =>
  gulp
    .src(['./index.d.ts.', './src/main.ts', './src/**/*.ts', './test/fixtures.ts', './test/test-helper.ts', './test/**/*-test.ts'], { base: '.' })
    .pipe(tsProject())
    .pipe(gulp.dest('tmp/test'))
    .pipe(mocha())
);

gulp.task('watch', function () {
  return watch(['src/**/*', 'test/**/*'], function () {
    gulp.start('test')
  })
});

gulp.task('test-browser', function () {
  gulp
    .src(['./index.d.ts.', './src/main.ts', './src/**/*.ts', './test/fixtures.ts', './test/test-helper.ts', './test/**/*-test.ts'], { base: '.' })
    .pipe(tsProject())
    .pipe(webpack(require('./webpack.config.js') ))
    .pipe(gulp.dest('tmp/browser'))
});

gulp.task('build', function () {
  gulp
    .src(['./index.d.ts', './src/main.ts'])
    .pipe(tsProject())
    .pipe(webpack(require('./webpack.config.js') ))
    .pipe(gulp.dest('dist/'))
});
