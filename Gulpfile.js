var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    concat = require('gulp-concat'),
    ts = require('gulp-typescript'),
    eventStream = require('event-stream'),
    karma = require('karma').server;

var tsProject = ts.createProject({
    target: 'ES5'
});

var testFiles = [
    "bower_components/d3/d3.min.js",
    "bower_components/angular/angular.min.js",
    "vendor/mm-foundation-tpls-0.5.1.min.js",
    "src/**/*.js"
];

gulp.task('scripts', function () {
    var tsResult = gulp.src(['defs/*.d.ts', 'src/**/*.ts'])
        .pipe(ts(tsProject));

    var jsResult = gulp.src('src/**/*.js');

    return eventStream.merge( // Merge the two output streams, so this task is finished when the IO of both operations are done.
        tsResult.js,
        jsResult
    )
        .pipe(concat('jsflap.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('pretest', function () {
    return gulp.src(['defs/*.d.ts', 'src/**/*.ts', 'test/**/*.ts'])
        .pipe(ts(tsProject))
        .pipe(concat('jsflap-withtests.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('styles', function () {
    gulp.src('./src/**/*.css')
        .pipe(concat('jsflap.css'))
        .pipe(gulp.dest('./dist/css'))
});

gulp.task('build', ['scripts', 'styles']);

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('src/**', ['build']);
    gulp.watch('dist/**').on('change', livereload.changed);
});

gulp.task('test', function () {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    });
});

gulp.task('default', ['build', 'watch']);