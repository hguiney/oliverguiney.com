var gulp = require('gulp');
var vulcanize = require('gulp-vulcanize');
var htmlmin = require('gulp-htmlmin');
var minifyInline = require('gulp-minify-inline');
var del = require('del');
var imagemin = require('gulp-imagemin');
var replace = require('gulp-replace');

/* Clean */
gulp.task('clean', function () {
  return del([
    'build/**/*',
    'build/**/.*'
  ]);
});

/* Copy */
gulp.task('copy:server', ['clean'], function () {
  return gulp.src(['.htaccess', 'favicon.*', 'apple-touch-*', 'index.html', 'CNAME'])
    .pipe(gulp.dest('build/'));
});

gulp.task('copy:images', ['clean'], function () {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('build/images/'));
});

gulp.task('copy:fonts', ['clean'], function () {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('build/fonts/'));
});

gulp.task('copy:shared-styles', ['clean'], function () {
  return gulp.src('src/shared-styles/**/*')
    .pipe(gulp.dest('build/shared-styles/'));
});

gulp.task('copy:polymer', ['clean'], function () {
  return gulp.src('bower_components/polymer/**/*')
    .pipe(gulp.dest('build/bower_components/polymer/'));
});

gulp.task('copy:fragments', ['clean'], function () {
  return gulp.src(['src/og-portfolio__slide/**/*'])
    .pipe(gulp.dest('build/og-portfolio__slide/'));
});

gulp.task('copy', ['copy:polymer', 'copy:server', 'copy:images', 'copy:fonts', 'copy:fragments', 'copy:shared-styles']);

/* Vulcanize */
gulp.task('rewrite', ['copy'], function(){
  return gulp.src('build/**/*.html')
    .pipe(replace(/((?:href|src)=(["']))(\.\.\/)+([^\2]+)(\2)/g, '$1/$4$5'))
    .pipe(gulp.dest('build/'));
});

var vulcanizeOptions = {
  stripComments: true,
  inlineScripts: true,
  inlineCss: true,
  excludes: ['bower_components/polymer/polymer.html']
  // stripExcludes: ['bower_components/polymer/polymer.html']
};

gulp.task('vulcanize:entrypoint', ['copy', 'rewrite'], function() {
  return gulp.src('index.html')
    .pipe(vulcanize(vulcanizeOptions))
    .pipe(gulp.dest('build'));
});

gulp.task('vulcanize:fragments', ['copy', 'rewrite'], function() {
  return gulp.src(['build/og-portfolio__slide/**/*'])
    .pipe(vulcanize(vulcanizeOptions))
    .pipe(gulp.dest('build/og-portfolio__slide/'));
});

gulp.task('vulcanize', ['vulcanize:entrypoint', 'vulcanize:fragments']);

/* Minify */
gulp.task('minify:html', ['vulcanize'], function() {
  return gulp.src('build/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
});

gulp.task('minify:inline', ['minify:html'], function() {
  return gulp.src('build/*.html')
    .pipe(minifyInline())
    .pipe(gulp.dest('build/'));
});

gulp.task('minify:images', function(){
  return gulp.src('build/images/**/*.{png,svg}')
    .pipe(imagemin([
      // imagemin.gifsicle({interlaced: true}),
      // imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({plugins: [{removeViewBox: true}]})
    ]))
    .pipe(gulp.dest('build/images'));
});

gulp.task('minify', ['minify:inline']);

/* Default */
// Beceause each meta-task relies on the last, we only have to call the latter task in order to call all previous tasks up the chain
gulp.task('default', ['minify']);