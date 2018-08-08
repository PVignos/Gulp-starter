// =========================================================
// GLOBAL PLUGINS
// =========================================================
var gulp 			        = require('gulp');
var del 			        = require('del');
var cache                   = require('gulp-cache');
// =========================================================
// LOCAL PLUGINS
// =========================================================
var fileinclude             = require("gulp-file-include"),         // html
    plumber                 = require('gulp-plumber'),              // *
    browserSync             = require('browser-sync').create(),     // *
    sourceMaps              = require('gulp-sourcemaps'),           // css, less, scss, js
    autoPrefixer            = require('gulp-autoprefixer'),         // css, less, scss
    minifyCss               = require('gulp-minify-css'),           // css, less
    concat                  = require('gulp-concat'),               // css, js
    less                    = require('gulp-less'),                 // less
    sass                    = require('gulp-sass'),                 // scss
    uglify 			        = require('gulp-uglify'),               // js
    eslint                  = require('gulp-eslint'),               // js.lint
    notify 			        = require('gulp-notify'),               // js.lint
    handlebars		        = require('gulp-handlebars'),           // handlebars
    handlebarsLib	        = require('handlebars'),                // handlebars
    declare			        = require('gulp-declare'),              // handlebars
    wrap			        = require('gulp-wrap'),                 // handlebars
    imagemin		        = require('gulp-imagemin'),             // assets
    imageminPngquant        = require('imagemin-pngquant'),         // assets
    imageminJpegRecompress  = require('imagemin-jpeg-recompress'),  // assets
    zip 			        = require('gulp-zip'),                  // backup
    critical 		        = require('critical').stream;           // criticalCss

//Less plugins
var lessPluginAutoprefix 	= require('less-plugin-autoprefix');
var LessAutoPrefix 	        = new lessPluginAutoprefix({
    browsers: ['last 2 versions']
});

// =========================================================
// FILE PATH
// =========================================================
var DIST_PATH 		= 'dist';
var MODULES_PATH    = 'node_modules';
var CSS_PATH 		= 'src/css/**/*.css';
var LESS_MAIN_PATH  = 'src/less/loader.less';
var LESS_PATH       = 'src/css/**/*.less';
var SCSS_PATH       = 'src/scss/*.scss';
var JS_PATH 	    = 'src/js/**/*.js';
var HBS_PATH        = 'src/templates/**/*.hbs';
var ASSETS_PATH 	= 'src/assets/**/*.{png,jpeg,jpg,svg,gif}';
var HTML_PATH       = 'src/**/*.html';
var ZIP_PATH        = 'zip';

// =========================================================
// CLEAN
// =========================================================
gulp.task( 'del', function() {
    return del([
        DIST_PATH
    ]);
} );
gulp.task( 'del.modules', function() {
    return del([
        MODULES_PATH
    ]);
} );
gulp.task( 'del.zip', function() {
    return del([
        ZIP_PATH
    ]);
} );

// =========================================================
// FILE INCLUDE
// =========================================================
gulp.task('fileInclude', function() {
    return gulp.src( HTML_PATH )
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest( DIST_PATH ));
});

// =========================================================
// CRITICAL CSS SMALL - ABOVE THE FOLD
// =========================================================
gulp.task('css.small', function () {
    return gulp.src( HTML_PATH )
        .pipe(critical({
            inline: true,
            base: './',
            width: 1024,
            height: 768,
            minify: true
        }))
        .on('error', function(err) { console.log( err.message ); })
        .pipe( gulp.dest( DIST_PATH ) );
});

// =========================================================
// CRITICAL CSS - SINGLE PAGE
// =========================================================
gulp.task('css.specificPage', function () {
    return gulp.src( HTML_PATH )
        .pipe(critical({
            inline: false,
            base: './',
            minify: true
        }))
        .on('error', function(err) { console.log( err.message ); })
        .pipe( gulp.dest( DIST_PATH + '/css/pages' ) );
});

// =========================================================
// COMPILE CSS
// =========================================================
gulp.task( 'css', function() {
    return gulp.src( [CSS_PATH] )
        .pipe( plumber(function(err) {
            console.log( err );
            this.emit('end');
        }) )
        .pipe( sourceMaps.init() )
        .pipe( autoPrefixer({
            browsers: ['last 2 versions', 'ie 8', 'ie 9']
        }) )
        .pipe( concat('styles.css') )
        .pipe( minifyCss() )
        .pipe( sourceMaps.write() )
        .pipe( gulp.dest( DIST_PATH + '/css' ) )
        .pipe( browserSync.stream() );
} );

// =========================================================
// COMPILE LESS
// =========================================================
gulp.task( 'less', function() {
    return gulp.src( LESS_MAIN_PATH )
        .pipe( plumber(function(err) {
            console.log( err );
            this.emit('end');
        }) )
        .pipe( sourceMaps.init() )
        .pipe( less({
            plugins: [ LessAutoPrefix ]
        }) )
        .pipe( autoPrefixer() )
        .pipe( minifyCss() )
        .pipe( sourceMaps.write() )
        .pipe( gulp.dest( DIST_PATH + '/css' ) )
        .pipe( browserSync.stream() );
} );

// =========================================================
// COMPILE SASS
// =========================================================
gulp.task( 'scss', function() {
    return gulp.src( SCSS_PATH )
        .pipe( plumber(function(err) {
            console.log( err );
            this.emit('end');
        }) )
        .pipe( sourceMaps.init() )
        .pipe( sass({
            outputStyle: 'compressed'
        }) )
        .pipe( autoPrefixer() )
        .pipe( sourceMaps.write() )
        .pipe( gulp.dest( DIST_PATH + '/css' ) )
        .pipe( browserSync.stream() );
} );

// =========================================================
// COMPILE JS
// =========================================================
gulp.task( 'js', function() {
    return gulp.src( JS_PATH )
        .pipe( plumber(function(err) {
            console.log( err );
            this.emit('end');
        }) )
        .pipe( sourceMaps.init() )
        .pipe( uglify() )
        .pipe( concat('scripts.js') )
        .pipe( sourceMaps.write() )
        .pipe( gulp.dest( DIST_PATH + '/js' ) )
        .pipe( browserSync.stream() );
} );

// =========================================================
// JS lint
// =========================================================
gulp.task('js.lint', function() {
    return gulp.src( JS_PATH )
        .pipe( eslint() )
        .pipe( eslint.format() )
        .pipe(
            eslint.failOnError()
                .on('error', notify.onError({
                    title: 'JavaScript Error',
                    subtitle: [
                        '<%= error.lineNumber %>'
                    ].join(':'),
                    message: '<%= error.message %>',
                    open: 'file://<%= error.fileName %>',
                    templateOptions: {
                        relative: JS_PATH,
                        date: new Date()
                    }
                }))
        )
        .pipe( eslint.failAfterError() );
});

// =========================================================
// HBS - Handlebars lint
// =========================================================
gulp.task( 'hbs', function() {
    return gulp.src( HBS_PATH )
        .pipe( handlebars({
            handlebars: handlebarsLib
        }) )
        .pipe( wrap('Handlebars.template(<%= contents %>)') )
        .pipe( declare({
            namespace: 		'templates',
            noRedeclare: 	true
        }) )
        .pipe( concat('templates.js') )
        .pipe( gulp.dest( DIST_PATH + '/js' ) )
        .pipe( browserSync.stream() );
} );

// =========================================================
// ASSETS - Optimization images
// =========================================================
gulp.task( 'assets', function() {
    return gulp.src( ASSETS_PATH )
        .pipe( imagemin([
            imagemin.gifsicle(),
            imagemin.jpegtran(),
            imagemin.optipng(),
            imagemin.svgo(),
            imageminPngquant(),
            imageminJpegRecompress()
        ]) )
        .pipe( gulp.dest( DIST_PATH + '/assets' ) );
} );

// =========================================================
// ZIP - EXPORT
// =========================================================
gulp.task( 'zip', function() {
    var c = new Date();
    var fileName = c.getDate()+'-'+(c.getMonth()+1)+'-'+c.getFullYear()+'_'+c.getHours()+'-'+c.getMinutes()+'-'+c.getSeconds()+'.zip';
    return gulp.src( 'src/**/*' )
        .pipe( zip( fileName ) )
        .pipe( gulp.dest( './zip' ) );
} );

// *********************************************************
// *********************************************************
// *********************************************************

// =========================================================
// SERVE - DEFAULT
// =========================================================
gulp.task( 'default', function() {
    browserSync.init({
        server: {
            baseDir: "./",
            directory: true
        }
    });

    gulp.watch( CSS_PATH , gulp.series('css') );
    gulp.watch( LESS_PATH , gulp.series('less') );
    gulp.watch( SCSS_PATH , gulp.series('scss') );
    gulp.watch( JS_PATH , gulp.series('js') );
    gulp.watch( HBS_PATH , gulp.series('hbs') );
    gulp.watch( ASSETS_PATH , gulp.series('assets') );

    gulp.watch( HTML_PATH , gulp.series( 'css.small', 'css.specificPage', 'fileInclude', browserSync.reload ) );
    //gulp.watch( HTML_PATH ).on( 'change', browserSync.reload );
} );