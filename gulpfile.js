var gulp = require('gulp');
var pug = require('gulp-pug');

var paths = {
  src: './src/**/*',
  srcPug: './src/**/*.jade',
  srcJS: './src/**/*.js',
  dist: './public/'
}

gulp.task('build', function () {
  gulp.src(paths.srcPug)
    .pipe(pug())
    .pipe(gulp.dest(paths.dist));
  gulp.src(paths.srcJS)
    .pipe(gulp.dest(paths.dist));
});
gulp.task('default', ['build']);
