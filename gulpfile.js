var gulp         = require('gulp');

var autoprefixer = require('gulp-autoprefixer');
var cleanCSS     = require('gulp-clean-css');
var concat       = require('gulp-concat');
var htmlMin      = require('gulp-htmlmin');
var rev          = require('gulp-rev');
var uglify       = require('gulp-uglify');
var usemin       = require('gulp-usemin');
var gutil        = require('gulp-util');
var stylus = require('gulp-stylus');

var merge        = require('merge-stream');
var runSequence  = require('run-sequence');
var pump         = require('pump');


gulp.task('compile-css', function () {
  gulp.src(['assets/css/app.styl'])
    .pipe(stylus({
      'include css': true
    }))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(concat('app.css')).pipe(gulp.dest('assets/css/dist'));
});

gulp.task('compress-js', function (callback) {
  pump([
        gulp.src('assets/js/*.js'),
        uglify(),
        gulp.dest('assets/js/dist')
    ],
    callback
  );
});

// gulp.task('hbs-usemin', function (callback) {
//   pump([
//     gulp.src('src/*.hbs'),
//     usemin({
//       js: [ uglify().on('error', function(err) {gutil.log(gutil.colors.red('[Local Error]'), err.toString());this.emit('end');}), rev() ]
//     }),
//     gulp.dest('./')
//     ],
//     callback
//   );
// });

gulp.task('watch', function() {
  gulp.watch('assets/css/*.styl', ['compile-css']);
  // gulp.watch('assets/js/*.js', ['compress-js', 'hbs-usemin']);
  // gulp.watch('src/*.hbs', ['hbs-usemin']);
});

gulp.task('default', function (callback) {
  runSequence(
    'compile-css',
    'compress-js',
    // 'hbs-usemin',
    function (error) {
      if (error) {
        console.log(error.message);
      } else {
        console.log('Assets prepared successfully! To keep gulp running, use `gulp watch`.');
      }
      callback(error);
    });
});
