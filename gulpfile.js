// Определяем константы Gulp
const { src, dest, parallel, series, watch } = require('gulp');

// Подключаем Browsersync
const browserSync = require('browser-sync').create();

// Подключаем gulp-concat
const concat = require('gulp-concat');

// Подключаем gulp-uglify-es
const uglify = require('gulp-uglify-es').default;

// Подключаем модули gulp-sass и gulp-less
const sass = require('gulp-sass')(require('sass'));

// Подключаем Autoprefixer
const autoprefixer = require('gulp-autoprefixer');

// Подключаем модуль gulp-clean-css
const cleancss = require('gulp-clean-css');

const sourcemaps = require('gulp-sourcemaps');

// Подключаем compress-images для работы с изображениями
const imagecomp = require('compress-images');

// Подключаем модуль del
const del = require('del');

// Определяем логику работы Browsersync
function browsersync() {
	browserSync.init({
		// Инициализация Browsersync
		server: { baseDir: 'app/' }, // Указываем папку сервера
		notify: false, // Отключаем уведомления
		online: true, // Режим работы: true или false
	});
}

function scripts() {
	return src([
		// Берём файлы из источников
		'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
		'app/js/app.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
	])
		.pipe(concat('app.min.js')) // Конкатенируем в один файл
		.pipe(uglify()) // Сжимаем JavaScript
		.pipe(dest('app/js/')) // Выгружаем готовый файл в папку назначения
		.pipe(browserSync.stream()); // Триггерим Browsersync для обновления страницы
}

function styles() {
	return (
		src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
			// .pipe(sourcemaps.init())
			// .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
			.pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
			.pipe(concat('app.min.css')) // Конкатенируем в файл app.min.js
			.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
			// .pipe(sourcemaps.write('.'))
			.pipe(cleancss({ level: { 1: { specialComments: 0 } } /* , format: 'beautify' */ })) // Минифицируем стили
			.pipe(dest('app/css/')) // Выгрузим результат в папку "app/css/"
			.pipe(browserSync.stream())
	); // Сделаем инъекцию в браузер
}

async function images() {
	imagecomp(
		'app/img/src/**/*', // Берём все изображения из папки источника
		'app/img/dest/', // Выгружаем оптимизированные изображения в папку назначения
		{ compress_force: false, statistic: true, autoupdate: true },
		false, // Настраиваем основные параметры
		{ jpg: { engine: 'mozjpeg', command: ['-quality', '75'] } }, // Сжимаем и оптимизируем изображеня
		{ png: { engine: 'pngquant', command: ['--quality=75-100', '-o'] } },
		{ svg: { engine: 'svgo', command: '--multipass' } },
		{ gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } },
		function (err, completed) {
			// Обновляем страницу по завершению
			if (completed === true) {
				browserSync.reload();
			}
		}
	);
}

function cleanimg() {
	return del('app/img/dest/**/*', { force: true }); // Удаляем всё содержимое папки "app/images/dest/"
}

function buildcopy() {
	return src(
		[
			// Выбираем нужные файлы
			'app/css/**/*.min.css',
			'app/js/**/*.min.js',
			'app/img/dest/**/*',
			'app/**/*.html',
		],
		{ base: 'app' }
	) // Параметр "base" сохраняет структуру проекта при копировании
		.pipe(dest('dist')); // Выгружаем в папку с финальной сборкой
}

function cleandist() {
	return del('dist/**/*', { force: true }); // Удаляем всё содержимое папки "dist/"
}

function startwatch() {
	// Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
	watch(['app/js/**/*.js'], browserSync.reload);

	// Мониторим файлы препроцессора на изменения
	watch('app/scss/**/*.scss', styles);

	// Мониторим файлы HTML на изменения
	watch('app/*.html').on('change', browserSync.reload);

	// Мониторим папку-источник изображений и выполняем images(), если есть изменения
	watch('app/img/', browserSync.reload);
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

// Создаём новый таск "build", который последовательно выполняет нужные операции
exports.build = series(cleandist, styles, scripts, images, buildcopy);

// Экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(styles, browsersync, startwatch);
