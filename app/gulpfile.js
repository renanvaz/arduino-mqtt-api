var gulp = require('gulp');
var jspm = require('jspm');

// watch files for changes and reload
gulp.task('watch', ['jspm'], function() {
  var browserSync = require('browser-sync');
  browserSync({
    online: false,
    server: {
      baseDir: './',
      index: 'app/index.html'
    }
  });

  gulp.watch([
    'src/**/*.*'
  ], ['jspm'], function(file){
    browserSync.reload(file.path);
  });
});

gulp.task('jspm', function() {
  return jspm.bundleSFX('src/Board', 'lib/Board.js', {sourceMaps: false});
});
