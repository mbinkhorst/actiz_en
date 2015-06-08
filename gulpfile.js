/* jshint node:true */
'use strict';

  
// generated on 2015-02-05 using generator-gulp-webapp 0.2.0
var gulp = require('gulp'),
	plugins = require('gulp-load-plugins')(),

	neatSassPath = require('node-neat').includePaths,

	sprite = require('css-sprite').stream;




// Generate Base64 SCSS
gulp.task('sprite-base64', function() {

	return gulp.src('app/images/sprite/*.png')
		.pipe(sprite({
			base64: true,
			style: '_base64.scss',
			processor: 'scss',
			format: 'png',
			retina: false,
			prefix: 'sprite',
			orientation: 'vertical'
		}))
		.pipe(
			gulp.dest('app/styles/mixins'));


});


// SASS
gulp.task('styles', function () {
	

	return gulp.src([
			'app/styles/main.scss',
			'app/styles/mobile.scss'
		])
		.pipe(plugins.plumber())
		.pipe(plugins.rubySass({
			loadPath: [].concat(neatSassPath),
			style: 'expanded',
			precision: 10
		}))
		.pipe(plugins.autoprefixer({browsers: ['last 1 version']}))
		.pipe(gulp.dest('.tmp/styles'))
		.on('error', console.error.bind(console));
		
});

// JS Hint linting
gulp.task('jshint', function () {
	return gulp.src('app/scripts/**/*.js')
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('jshint-stylish'))
		.pipe(plugins.jshint.reporter('fail'));
});

// JS Hint linting in watch
gulp.task('jshint-easy', function () {
	return gulp.src('app/scripts/**/*.js')
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('jshint-stylish'));
});


// Build HTML
gulp.task('html', ['styles'], function () {
	var assets = plugins.useref.assets({searchPath: '{.tmp,app}'});

	return gulp.src([
			'app/*.html'
		])
		.pipe(assets)
		.pipe(plugins.if('*.js', plugins.uglify()))
		.pipe(plugins.if('*.css', plugins.csso()))
		.pipe(assets.restore())
		.pipe(plugins.useref())
		//.pipe(plugins.if('*.php', plugins.minifyHtml({conditionals: true, loose: true})))
		.pipe(gulp.dest('dist'));

});

// Json
gulp.task('json', function() {

	// Lang
	gulp.src('app/**/*.json')
		.pipe(plugins.jsonminify())
		.pipe(gulp.dest('dist'));



});

// Compress/minify images
gulp.task('images', function () {
	return gulp.src([
			'app/images/**/*',
			'!app/images/sprite.png',
			'!app/images/sprite/*',
			'!app/images/sprite',
		])
		.pipe(plugins.cache(plugins.imagemin({
			progressive: true,
			interlaced: true
		})))
		.pipe(gulp.dest('dist/images'));
});

// Flatten fonts
gulp.task('fonts', function () {
	return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
		.pipe(plugins.filter('**/*.{eot,svg,ttf,woff}'))
		.pipe(plugins.flatten())
		.pipe(gulp.dest('dist/fonts'));
});



// Copy extra files to dist/
gulp.task('extras', function () {
	gulp.src([
		'app/*.*',
		'!app/*.html'
	], {
		dot: true
	}).pipe(gulp.dest('dist'));


	// JWplayer 
	gulp.src(['app/vendor/**'])
		.pipe(gulp.dest('dist/vendor'));


	// Case videos
	gulp.src('app/cases/**/*.mp4')
		.pipe(gulp.dest('dist/cases'));


	// Documents and media
	gulp.src([	
		'app/documents/**'
	], {
		dot: true
	}).pipe(gulp.dest('dist/documents'));
	gulp.src([	
		'app/media/**'
	], {
		dot: true
	}).pipe(gulp.dest('dist/media'));

	// Views
	gulp.src([
		'app/views/**'
	], {
		dot: true
	}).pipe(gulp.dest('dist/views'));

});


// Clean up task
gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));



gulp.task('connect', ['styles'], function () {

	// Run static server on 9000
	var serveStatic = require('serve-static');
	var serveIndex = require('serve-index');
	var modRewrite = require('connect-modrewrite');
	var app = require('connect')()
		
		.use(modRewrite([
			'^/m$ /mobile.html [L]',
			'^/m/[^\.]*$ /mobile.html [L]',
			'^/[^\.]+$ /index.html'
		]))

		.use(require('connect-livereload')({port: 35729}))
		.use(serveStatic('.tmp'))
		.use(serveStatic('app'))

		// paths to bower_components should be relative to the current file
		// e.g. in app/index.php you should use ../bower_components
		.use('/bower_components', serveStatic('bower_components'))
		

		.use(serveIndex('app'));

	require('http').createServer(app)
		.listen(9000)
		.on('listening', function () {
			console.log('Started connect web server on http://localhost:9000');
		});



});

gulp.task('serve', ['connect', 'watch'], function () {
	require('opn')('http://localhost:9000');
});


// inject bower components
gulp.task('wiredep', function () {
	var wiredep = require('wiredep').stream;

	gulp.src('app/styles/*.scss')
		.pipe(wiredep())
		.pipe(gulp.dest('app/styles'));

	gulp.src('app/*.html')
		.pipe(wiredep())
		.pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect'], function () {
	plugins.livereload.listen();

	// watch for changes
	gulp.watch([
		'app/*.html',
		'app/m/*.html',
		'.tmp/styles/**/*.css',
		'app/scripts/**/*.js',
		'app/images/**/*',
		'app/views/**/*.jt',
		'app/lang/**/*.json'
	]).on('change', plugins.livereload.changed);

	gulp.watch('app/images/sprite/**', ['sprite-base64']);
	gulp.watch('app/styles/**/*.scss', ['styles']);
	gulp.watch('bower.json', ['wiredep']);

	// constantly hint.
	gulp.watch('app/scripts/**/*.js', ['jshint-easy']);

});

gulp.task('build', ['jshint', 'json', 'sprite-base64', 'html', 'images', 'fonts', 'extras'], function () {
	return gulp.src('dist/**/*').pipe(plugins.size({title: 'build', gzip: false}));
});

gulp.task('default', ['clean'], function () {
	gulp.start('build');
});
