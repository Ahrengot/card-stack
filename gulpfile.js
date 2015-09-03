var _ = require( 'underscore' );

// Gulp + gulp tools
var gulp = require('gulp');
var runSequence = require('run-sequence');
var $ = require( 'gulp-load-plugins' )();
var livereload = require('gulp-livereload');
var opn = require ('opn');

// Webpack
var webpack = require("webpack");
var webpackConfig = require("./webpack/config.js");
var webpackBuildConfig = require("./webpack/config-build.js");

var path = require('path');
var paths = require('./paths');

var flags = {
	isBuild: false
};

/**
 * Tasks =========================================================================================
 */

gulp.task('index', function() {
	var sources = gulp.src([
		paths.dist + 'styles/main.css',
		paths.dist + 'scripts/combined' + (flags.isBuild ? '.min.js' : '.js'),
	], {read: false});

	return gulp.src( paths.base + 'index.html' )
		.pipe( $.inject( sources, { addRootSlash: false, ignorePath: paths.dist } ) )
		.pipe( gulp.dest( paths.dist ) )
});


gulp.task('sass', function() {
	return gulp.src( paths.sass + 'main.scss' )
		.pipe( $.sass() )
		.pipe( $.autoprefixer( 'last 2 versions' ) )
		.pipe( gulp.dest( paths.css ) )
		.pipe( livereload() )
});

gulp.task('webpack', function() {
	var config = flags.isBuild ? webpackBuildConfig : webpackConfig;

	return gulp.src( paths.js + '**/*.jsx' )
		.pipe( $.webpack(config, webpack) )
		.pipe( gulp.dest( paths.dist + 'scripts' ) )
		.pipe( livereload() )
});

gulp.task('clean', function () {
    return gulp.src( paths.dist + '*' )
        .pipe( $.clean() );
});

gulp.task('serve', ['dev'], function () {
	require( 'opn' )( paths.http );
});

gulp.task('watch', function() {
	livereload.listen();
	gulp.watch( paths.sass + '**/*.scss', ['sass'] );
	gulp.watch( paths.js + '**/*.jsx', ['webpack'] );
	gulp.watch( paths.base + 'index.html', ['index'] );
});

gulp.task('dev', function(callback) {
	runSequence('clean', ['sass', 'webpack'], 'index', 'watch', function() {
		$.connect.server({
			root: paths.dist
		});
		callback();
	});
});

gulp.task('build', function(callback) {
	flags.isBuild = true;
	runSequence('clean', ['sass', 'webpack'], 'index', callback);
})

gulp.task( 'default', ['dev'] );