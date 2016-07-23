var gulp = require('gulp');
var pug = require('gulp-pug');

var paths = {
  src: './src/**',
  dist: './public/'
}

gulp.task('build', function () {
  return gulp.src(paths.src)
    .pipe(pug())
    .pipe(gulp.dest(paths.dist));
});
gulp.task('default', ['build']);
