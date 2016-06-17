// Aqui nós carregamos o gulp e os plugins através da função `require` do nodejs
var gulp = require('gulp'),
    jsmin = require('gulp-jsmin'),
    htmlmin = require('gulp-htmlmin'),
    connect = require('gulp-connect'),
    critical = require('critical'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    imagemin = require('gulp-imagemin'),
    sourcemaps = require('gulp-sourcemaps'),
    cache = require('gulp-cache'),
    del = require('del'),
    runSequence = require('run-sequence'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber');

// Error handler
var onError = function(err) {
    gutil.beep();
    console.log(err);
};


// Definimos FALSE se não houver programação depois
var whitespace = false;

// Definimos o diretorio dos arquivos que serão verificados na pasta SRC
var filesSrc = {
    js: [
        './src/assets/js/jquery.min.js',
        './src/assets/vendor/*.js',
        './src/assets/js/*!(function.js|jquery.min.js).js',
        './src/assets/js/function.js'
    ],
    imgs: './src/assets/imgs/**/*',
    scss: './src/assets/css/*.scss',
    css: './src/assets/css/*.css',
    fonts: './src/assets/css/fonts/*',
    bower: './src/assets/bower/**/*',
    html: './src/pages/*.html',
    index: './src/index.html'
}

// Definimos o diretorio dos arquivos na pasta DIST
var dist = {
    js: './dist/assets/js/',
    imgs: './dist/assets/imgs/',
    tempCss: './src/assets/css/',
    css: './dist/assets/css/',
    fonts: './dist/assets/css/fonts/',
    bower: './dist/assets/bower',
    html: './dist/pages/',
    index: './dist/',
    mapJS: '/map/',
    mapCSS: '/map/'
}

// Tasks que rodarão por default, edite para sua preferência
var taskDefault = ['connect', 'watch'];

// LiveReload
gulp.task('connect', function() {
    connect.server({
        port: 8888,
        root: 'dist',
        livereload: true
    });
});


// Carregamos os arquivos JS
// E rodamos uma tarefa para concatenação
// Renomeamos o arquivo que sera minificado e logo depois o minificamos com o `jsmin`
// E pra terminar usamos o `gulp.dest` para colocar os arquivos concatenados e minificados na pasta dist/
gulp.task('js', function() {
    gulp.src(filesSrc.js) // Arquivos que serão carregados, veja variável 'filesSrc.js' no início
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(sourcemaps.init())
        .pipe(concat('script.js')) // Concatena os arquivos js => Task maior tempo de execução
        .pipe(jsmin()) // Transforma para formato ilegível
        .pipe(rename({
            suffix: '.min'
        })) // Arquivo único de saída
        .pipe(sourcemaps.write(dist.mapJS)) // Cria os sourcemaps
        .pipe(gulp.dest(dist.js)) // pasta de destino do arquivo(s)
        .pipe(connect.reload()); // LiveReload
});

// Carregamos os arquivos html
// Minificamos os HTML's
// E pra terminar usamos o `gulp.dest` para colocar os arquivos e minificados na pasta dist/
gulp.task('html', function() {
    gulp.src(filesSrc.html) // Arquivos que serão carregados, veja variável 'filesSrc.html' no início
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(htmlmin({
            collapseWhitespace: whitespace
        })) // Transforma para formato ilegível
        .pipe(gulp.dest(dist.html)) // pasta de destino do arquivo(s)
        .pipe(connect.reload()); // LiveReload
});

// Movemos a index para a pasta dist
// e a minificamos
gulp.task('index', function() {
    gulp.src(filesSrc.index) // Arquivos que serão carregados, veja variável 'filesSrc.index' no início
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(htmlmin({
            collapseWhitespace: whitespace
        })) // Transforma para formato ilegível
        .pipe(gulp.dest(dist.index)) // pasta de destino do arquivo(s)
        .pipe(connect.reload()); // LiveReload

});

// Apagamos a pasta dist
gulp.task('clean:dist', function() {
    return del.sync('dist');
})

// Se for preciso, apagamos o cache dos arquivos
gulp.task('cache:clear', function(callback) {
    return cache.clearAll(callback)
})

// Movemos as imagens para a pasta dist
gulp.task('imgs', function() {
    gulp.src(filesSrc.imgs) // Arquivos que serão carregados, veja variável 'filesSrc.imgs' no início
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(cache(imagemin())) // Otimiza as imagens e coloca em cache as que já foram
        .pipe(gulp.dest(dist.imgs)) // pasta de destino do arquivo(s)
});

// Movemos as fontes para a pasta dist
gulp.task('fonts', function() {
    gulp.src(filesSrc.fonts) // Arquivos que serão carregados, veja variável 'filesSrc.fonts' no início
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(gulp.dest(dist.fonts)) // pasta de destino do arquivo(s)
});

// Carregamos os arquivos SCSS
// E compilamos o SASS
// Criamos o sourcemap
gulp.task('sass', function() {
    return gulp.src(filesSrc.scss) // Arquivos que serão carregados, veja variável 'filesSrc.scss' no início
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        })) // Converte Sass para CSS
        .pipe(rename('style.min.css'))
        .pipe(sourcemaps.write(dist.mapCSS)) // Cria os sourcemaps
        .pipe(gulp.dest(dist.css)) // pasta de destino do arquivo(s)
        .pipe(connect.reload()); // LiveReload
});

gulp.task('bower', function() {
    return gulp.src(filesSrc.bower)
        .pipe(gulp.dest(dist.bower));
});

// Tarefa de monitoração caso algum arquivo seja modificado, deve ser executado e deixado aberto, comando "gulp watch".
gulp.task('watch', function() {
    gulp.watch(filesSrc.js, ['js']); // Olha por mudanças nos arquivos JS
    gulp.watch(filesSrc.html, ['html']); // Olha por mudanças nos arquivos HTML
    gulp.watch(filesSrc.scss, ['sass']); // Olha por mudanças nos arquivos SASS
    gulp.watch(filesSrc.imgs, ['imgs']); // Olha por mudanças nos arquivos IMGS
    gulp.watch(filesSrc.index, ['index']); // Olha por mudanças nos arquivos INDEX
});

gulp.task('critical', ['index'], function(cb) {
    return critical.generate({
        inline: true,
        base: './dist/',
        src: 'index.html',
        dest: './dist/index.html',
        minify: true
    });
});

// Tarefa padrão quando executado o comando GULP
gulp.task('default', function(callback) {
    runSequence('clean:dist', 'sass', 'bower', 'fonts', 'imgs', 'js', 'html', 'index', taskDefault, callback)
});
