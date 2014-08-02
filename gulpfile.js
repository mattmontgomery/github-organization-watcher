var gulp = require('gulp'),
    bower = require('gulp-bower'),
    sass = require('gulp-sass'),
    shell = require('gulp-shell'),
    path = {};
path.styles = {};
path.styles.watch = ['./scss/*.scss'];
path.styles.src = ['./scss/app.scss'];

gulp.task('bower', function() {
    return bower().pipe(gulp.dest('public/vendor/'))
});

gulp.task('sass', function () {
    gulp.src(path.styles.src)
        .pipe(sass({
            includePaths: ['./scss'],
            errLogToConsole: true
        }))
        .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('watch', function(event) {
    gulp.watch(path.styles.src, ['sass']);
});

gulp.task('server', shell.task(['npm start']));

gulp.task('build', ['bower', 'sass']);

gulp.task('default', ['watch', 'server']);
