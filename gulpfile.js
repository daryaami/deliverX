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
	browserSync.init({ // Инициализация Browsersync
		server: { baseDir: './' }, // Указываем папку сервера
		notify: false, // Отключаем уведомления
		online: true // Режим работы: true или false
	})
}

const scripts = () => {
	return src([ // Берем файлы из источников
		//'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
		'js/script.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
		])
	.pipe(concat('min.js')) // Конкатенируем в один файл
	.pipe(uglify()) // Сжимаем JavaScript
	.pipe(dest('js/')) // Выгружаем готовый файл в папку назначения
	.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

const styles = () => {
	return src('sass/main.scss') // Выбираем источник
	.pipe(eval(sass)()) // Преобразуем в функцию
	.pipe(concat('min.css')) // Конкатенируем в файл app.min.js
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
	.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } )) // Минифицируем стили
	.pipe(dest('css/')) // Выгрузим результат в папку "app/css/"
	.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

async function images() {
	imagecomp(
		"images/src/**/*", // Берём все изображения из папки источника
		"images/dest/", // Выгружаем оптимизированные изображения в папку назначения
		{ compress_force: false, statistic: true, autoupdate: true }, false, // Настраиваем основные параметры
		{ jpg: { engine: "mozjpeg", command: ["-quality", "75"] } }, // Сжимаем и оптимизируем изображеня
		{ png: { engine: "pngquant", command: ["--quality=75-100", "-o"] } },
		{ svg: { engine: "svgo", command: "--multipass" } },
		{ gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
		function (err, completed) { // Обновляем страницу по завершению
			if (completed === true) {
				browserSync.reload()
			}
		}
	)
}

const cleanimg = () => {
	return del('images/dest/**/*', { force: true }) // Удаляем все содержимое папки "app/images/dest/"
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

	// Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
	watch(['**/*.js', '!**/*.min.js'], scripts);
	
	// Мониторим файлы препроцессора на изменения
	watch('**/sass/**/*', styles);

	// Мониторим файлы HTML на изменения
	watch('**/*.html').on('change', browserSync.reload);

	// Мониторим папку-источник изображений и выполняем images(), если есть изменения
	watch('images/src/**/*', images);

}

// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;

// Экспортируем функцию scripts() в таск scripts
exports.scripts = scripts;

// Экспортируем функцию styles() в таск styles
exports.styles = styles;

// Экспорт функции images() в таск images
exports.images = images;

// Экспортируем функцию cleanimg() как таск cleanimg
exports.cleanimg = cleanimg;

// // Создаем новый таск "build", который последовательно выполняет нужные операции
// exports.build = series(cleandist, styles, scripts, images, buildcopy);

// Экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(styles, scripts, browsersync, startwatch);