/**
 * Created by alejandrojovermorales on 28/03/15.
 */
var gulp = require('gulp'),
connect = require('gulp-connect'),
watch = require('gulp-watch');


gulp.task('webserver', function() {
    connect.server({
        livereload: true
    });
});

gulp.task('watch', function () {
    watch([
        '*.html',
        'js/*.js',
        'scss/*.css'
    ]).pipe(connect.reload());
});

gulp.task('default', ['webserver', 'watch']);