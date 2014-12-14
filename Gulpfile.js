var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    concat = require('gulp-concat'),
    ts = require('gulp-typescript'),
    eventStream = require('event-stream');

var tsProject = ts.createProject({});

gulp.task('scripts', function() {
    var tsResult = gulp.src('src/**/*.ts')
        .pipe(ts(tsProject));

    var jsResult = gulp.src('src/**/*.js')

    return eventStream.merge( // Merge the two output streams, so this task is finished when the IO of both operations are done.
        tsResult.js,
        jsResult
    )
        .pipe(concat('jsflap.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('styles', function() {
    gulp.src('./src/**/*.css')
        .pipe(concat('jsflap.css'))
        .pipe(gulp.dest('./dist/css'))
});

gulp.task('build', ['scripts', 'styles']);

gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('build/**', ['build']);
});

