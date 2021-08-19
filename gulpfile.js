var gulp = require('gulp');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css')
var babel = require("gulp-babel");
var clean = require('gulp-clean');

gulp.task('clean', () => {
    return gulp.src('dist', {read: false, allowEmpty: true})
        .pipe(clean());
})

gulp.task('copy', () => {
    return gulp.src(["layui*/**", "minarui*/**/*.*", "app.config.js", "favicon.ico", "*.html", "*.jpg"])
        .pipe(gulp.dest('dist/'));
});

gulp.task("toes5", function () {
    return gulp.src(["dist/minarui/**/*.js", "!dist/minarui/plugins/**/*.js"])
        .pipe(babel())
        .pipe(gulp.dest("dist/minarui/"))
});
gulp.task('compressJS', function () {

    return gulp.src(['dist/minarui/**/*.js', "!dist/minarui/plugins/**/*.js"])
        .pipe(uglify({
            mangle: true
        }))

        .pipe(gulp.dest('dist/minarui/'));
});

gulp.task('compressCSS', function () {
    return gulp.src('dist/minarui/**/*.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest('dist/minarui/'))
})


gulp.task('build', gulp.series(
    'clean',
    'copy',
    'toes5',
    'compressJS',
    'compressCSS',
   ));

gulp.task("run", function () {
    connect.server({
        livereload: true,
        port: 6632
    });
})

