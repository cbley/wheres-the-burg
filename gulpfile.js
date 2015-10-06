var gulp = require('gulp');
var awspublish = require('gulp-awspublish');

gulp.task('upload', function upload() {
  var publisher = awspublish.create({
    params: {
      Bucket: 'wherestheburg.com'
    }
  });

  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };

  return gulp.src('dist/**')
    .pipe(awspublish.gzip({ext: ''}))
    .pipe(publisher.publish(headers))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
});
