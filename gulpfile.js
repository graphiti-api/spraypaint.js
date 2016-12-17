const gulp    = require('gulp');
const mocha   = require('gulp-mocha');
const clean   = require('gulp-clean');
const webpack = require('webpack-stream');
const ts      = require('gulp-typescript');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('test_clean', function () {
  //return gulp.src('./tmp/test/**/*', { read: false })
    //.pipe(clean());
});

gulp.task('test', ['test_clean'], () =>
  gulp
    .src(['./index.d.ts.', './src/**/*.ts', './test/test-helper.ts', './test/**/*-test.ts'], { base: '.' })
    .pipe(tsProject())
    .pipe(gulp.dest('tmp/test'))
    .pipe(mocha())
);

// Use webpack, not tsProject, for browserification
gulp.task('build', function () {
  return gulp.src("src/main.ts")
    .pipe(webpack(require('./webpack.config.js') ))
    .pipe(gulp.dest('dist/'))
});
