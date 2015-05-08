var gulp = require('gulp');

// load grunt tasks
// require('gulp-grunt')(gulp);

// auto-load gulp-* plugins
var $ = require('gulp-load-plugins')();

//
// all others
var del = require('del');
var autoprefixer = require('autoprefixer-stylus');

var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge2');

var config = require('./config.json');
var paths = config.paths;
var devmode = config.development;

// autoprefixer settings
var Browsers = ['last 2 versions'];

var stylusOptions = {
    use: [autoprefixer({browsers: Browsers})],
    paths: [paths.css.src],
    import: ['vars']
};


//
// styles

gulp.task('styles', function () {
    return merge(
        // vendor css
        gulp.src('bower_components/skeleton/css/*.css')
            .pipe($.stylus(stylusOptions))
            .pipe($.concatCss('skeleton.css')),

        // custom css
        gulp.src(paths.css.src + '/**/*.styl')
            .pipe($.stylus(stylusOptions))
            .pipe($.concatCss('all.css'))
        )
        .pipe($.concatCss('main.css'))
        .pipe($.if(!devmode, $.minifyCss({ advanced : false })))
        .pipe(gulp.dest(paths.css.dest));
//    .pipe(reload({ stream: true }));
});


//
// scripts

// vendor | no-minification
gulp.task('scripts-vendor', function(){
    return gulp.src([
            // zepto
            paths.js.src + '/vendor/zepto/*.js',
            'bower_components/zepto/zepto.min.js',

            // dust
            'bower_components/dustjs-linkedin/dist/dust-full.min.js',

            // sigma
            'assets/js/vendor/sigma/build/sigma.min.js',
            'assets/js/vendor/sigma/build/plugins/sigma.layout.forceAtlas2.min.js'
        ])
        .pipe(gulp.dest('public/js/vendor/'));
});

// custom
gulp.task('scripts-custom', function(){
    return gulp.src(paths.js.src + '/*.js')
        .pipe($.concat('main.js'))
        .pipe($.if(!devmode, $.uglify()))
        .pipe(gulp.dest(paths.js.dest));
});

// main js only
gulp.task('scripts-main', function(){
    return gulp.src(paths.js.src + '/*.js')
        .pipe($.concat('main.js'))
        .pipe($.if(!devmode, $.uglify()))
        .pipe(gulp.dest(paths.js.dest));
});

// templates
gulp.task('templates', function(){
    return gulp.src('templates/**/*.*')
        .pipe(gulp.dest('public/js/templates/'));
});

gulp.task('scripts', ['scripts-vendor', 'scripts-custom', 'templates'], function(){
    reload();
});


//
// html
//gulp.task('html', function(){
//    return gulp.src('src/index.html')
//        .pipe(gulp.dest('public/'));
//});


//
// data
//gulp.task('data', function(){
//    return gulp.src('src/*.json')
//        .pipe(gulp.dest('public/'));
//});


//
// images
gulp.task('images', function(){
    return gulp.src(paths.img.src + '/**')
        .pipe(gulp.dest(paths.img.dest));
});

gulp.task('favicon', function(){
    return gulp.src('favicon.ico')
        .pipe(gulp.dest('public/'));
});


//
// browser sync
gulp.task('sync', ['nodemon'], function(){
    browserSync.init(null, {
        proxy: "http://localhost:" + config.port,
        files: ["public/**/*.*"],
        port: config.port + 1000
//        , logLevel: "debug"
    });
});

//
// nodemon
gulp.task('nodemon', function (cb) {
    var called = false;
    return $.nodemon({script: 'app.js'}).on('start', function () {
        if (!called) {
            called = true;
            cb();
        }
    });
});

gulp.task('bs-reload', function(){
    reload();
});


//
// browser sync
// static version - you won't need nodemon
//gulp.task('sync', function(){
//    browserSync.init({
//        server: {
//            baseDir: "./public"
//        },
//        files: ["public/**/*.*"],
//        port: 4000
////        , logLevel: "debug"
//    });
//});


//
// cleanup
gulp.task('clean', function(cb){
    return del([
        paths.css.dest, paths.js.dest, paths.img.dest, 'public/*.ico'
//        , 'public/*.html', 'public/*.json'
    ], cb);
});


//
// build
gulp.task('build', ['clean'], function(){
    return $.runSequence(
//        'html', 'data',
        'images', 'favicon', 'styles', 'scripts'
    );
});


//
// publish
gulp.task('publish', function(){
    gulp.src([
//            '!./public/exclude.me',
            './public/**'
        ])
        .pipe($.zip('project.zip'))
        .pipe(gulp.dest('./'));
});


//
// default
gulp.task('default', ['clean'], function(){
    $.runSequence(
//        'html', 'data',
        'images', 'favicon', 'styles', 'scripts', 'sync',
        function(){
//            gulp.watch('./src/*.html', ['html']);
//            gulp.watch('./src/*.json', ['data']);
            gulp.watch('./assets/css/**/*.*', ['styles']);
//            gulp.watch('./assets/js/**/*.js', ['scripts']);
            gulp.watch('./assets/js/main.js', ['scripts-main']);
            gulp.watch('./templates/**/*.*', ['templates']);
            gulp.watch('./views/**/*.ejs', ['bs-reload']);
        });
});