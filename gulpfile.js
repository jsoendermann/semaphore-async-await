const gulp = require('gulp');
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const merge = require('merge2');


gulp.task('default', () => {
  const tsProject = ts.createProject('./tsconfig.json');
  const babelrc = require('./.babelrc.json');

  const tsStream = tsProject.src()
    .pipe(tsProject());

  return merge([
    tsStream
      .js
      .pipe(babel(babelrc))
      .pipe(gulp.dest('dist')),
    tsStream
      .dts
      .pipe(gulp.dest('dist/definitions')),
  ]);
});

gulp.task('watch', () => {
  gulp.watch('src/**/*.ts', ['default']);
});