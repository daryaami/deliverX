// константы Gulp
const { src, dest, parallel, /*series, */ watch } = require('gulp');

// Browsersync
const browserSync = require('browser-sync').create();

// gulp-concat
const concat = require('gulp-concat');

// gulp-uglify-es
const uglify = require('gulp-uglify-es').default;

// gulp-sass
const sass = require('gulp-sass')(require('sass'));

// Autoprefixer
const autoprefixer = require('gulp-autoprefixer');

// gulp-clean-css
const cleancss = require('gulp-clean-css');

// compress-images для работы с изображениями
const imagecomp = require('compress-images');

// модуль del
const del = require('del');

const browsersync = () => {
	browserSync.init({ 
		server: { baseDir: './' },
		notify: false, 
		online: true 
	})
}

const scripts = () => {
	return src([ 
		//'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
		'js/script.js', 
		])
	.pipe(concat('min.js'))
	.pipe(uglify()) 
	.pipe(dest('js/')) 
	.pipe(browserSync.stream()) 
}

const styles = () => {
	return src('sass/main.scss')
	.pipe(eval(sass)()) 
	.pipe(concat('min.css')) 
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) 
	.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } )) 
	.pipe(dest('css/')) 
	.pipe(browserSync.stream()) 
}

async function images() {
	imagecomp(
		"images/src/**/*", 
		"images/dest/",
		{ compress_force: false, statistic: true, autoupdate: true }, false, 
		{ jpg: { engine: "mozjpeg", command: ["-quality", "75"] } }, 
		{ png: { engine: "pngquant", command: ["--quality=75-100", "-o"] } },
		{ svg: { engine: "svgo", command: "--multipass" } },
		{ gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
		function (err, completed) { 
			if (completed === true) {
				browserSync.reload()
			}
		}
	)
}

const cleanimg = () => {
	return del('images/dest/**/*', { force: true }) 
}

// function buildcopy() {
// 	return src([ // Выбираем нужные файлы
// 		'/css/**/*.min.css',
// 		'/js/**/*.min.js',
// 		'/images/dest/**/*',
// 		'/**/*.html',
// 		], { base: '' }) // Параметр "base" сохраняет структуру проекта при копировании
// 	.pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
// }

// function cleandist() {
// 	return del('dist/**/*', { force: true }) // Удаляем все содержимое папки "dist/"
// }

const startwatch = () => {

	watch(['**/*.js', '!**/*.min.js'], scripts);
	
	watch('**/sass/**/*', styles);

	watch('**/*.html').on('change', browserSync.reload);

	watch('images/src/**/*', images);

}

exports.browsersync = browsersync;

exports.scripts = scripts;

exports.styles = styles;

exports.images = images;

exports.cleanimg = cleanimg;

// 
// exports.build = series(cleandist, styles, scripts, images, buildcopy);

// Дефолтный таск 
exports.default = parallel(styles, scripts, browsersync, startwatch);