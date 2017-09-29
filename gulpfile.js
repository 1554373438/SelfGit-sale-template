var gulp = require('gulp'),
  path = require('path'),
  pngquant = require('imagemin-pngquant'),
  del = require('del'),
  runSequence = require('run-sequence'),
  wiredep = require('wiredep').stream,
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload;

var $ = require('gulp-load-plugins')();

gulp.task('sass', function() {
  return gulp.src('app/sass/**/*.scss')
    .pipe($.sass({ outputStyle: 'compressed' }).on('error', $.sass.logError))
    .pipe($.autoprefixer())  //浏览器兼容前缀
    .pipe(gulp.dest('.tmp/css'))
    .pipe(reload({ stream: true }));
});

gulp.task('html', ['sass'], function() {
  var jsFilter = $.filter("**/*.js", { restore: true });
  var cssFilter = $.filter("**/*.css", { restore: true });
  var removeMapsFilter = $.filter('**/*.{html,js,css}', {restore: true});

  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp','app', '.']})) //可以把html里零碎的这些引入合并成一个文件，但是它不负责代码压缩。
    .pipe(jsFilter)
    .pipe($.sourcemaps.init()) //初始化sourcemap
    .pipe($.uglify()) //压缩js文件
    .pipe($.rev()) //解决静态资源缓存与更新的问题（生成一个md5文件）
    .pipe($.sourcemaps.write('maps')) //输出sourcemaps文件（如果不remove掉会替换js引入map文件）
    .pipe(jsFilter.restore) //还原所有文件
    .pipe(cssFilter)
    .pipe($.cssnano()) //css压缩
    .pipe($.rev())
    .pipe(cssFilter.restore) 
    .pipe(removeMapsFilter)
    .pipe($.revReplace()) //代入新的文件名
    .pipe(removeMapsFilter.restore)
    .pipe(gulp.dest('dist'))
});

gulp.task('htmlmin', ['html'], function() {
  return gulp.src('dist/**/*.html')
    .pipe($.htmlmin({
      removeEmptyAttributes: true, //除所有的空属性
      removeAttributeQuotes: true,
      collapseBooleanAttributes: true, //省略布尔属性的值
      collapseWhitespace: true, //清空空格 
      customAttrSurround: [
        [/@/, /(?:)/]
      ]
    }).on('error', console.error))
    .pipe(gulp.dest('dist'));
})

gulp.task('imagemin', function() {
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe($.cache($.imagemin({
      progressive: true, //无损压缩jpg图片
      svgoPlugins: [{ removeViewBox: false }], //不移除svg的viewbox属性
      use: [pngquant()]  // 使用pngquant插件进行深度压缩 
    })))
    .pipe(gulp.dest('dist/images'))
});

gulp.task('jsonmin', function() {
  return gulp.src('app/**/*.json')
    .pipe($.jsonminify())
    .pipe(gulp.dest('dist'));
});

gulp.task('base64', ['html'], function() {
  return gulp.src('dist/css/*.min.css')
    .pipe($.base64({
      baseDir: 'dist',
      extensions: ['png', /\.jpg#datauri$/i],
      exclude: [/\.server\.(com|net)\/dynamic\//, '--live.jpg'],
      maxImageSize: 3 * 1024, // bytes 
      debug: true
    }))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('other', function() {
  var fileFilter = $.filter(function (file) {
    return file.stat.isFile(); //是否是文件
  });

  return gulp.src([
      path.join('app', '/**/*'),
      path.join('!' + 'app/images' + '/**/*'),
      path.join('!' + 'app' + '/**/*.{html,css,js,scss,json}') //{}是包含的意思
    ])
    .pipe(fileFilter)
    .pipe(gulp.dest('dist'))
});

gulp.task('clean', del.bind(null, ['.tmp','dist']));

// inject bower components
gulp.task('wiredep', () => {

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./,
      optional: 'configuration',
      goes: 'here'
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', function(callback) {
  runSequence('clean', 'wiredep', ['html', 'base64', 'htmlmin', 'imagemin', 'jsonmin', 'other'], callback);
});

gulp.task('serve:dist', ['build'], function() {
  browserSync.init({
    notify: false, //是否通知
    port: 8000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve', function() {
  runSequence('wiredep', 'sass', function() {
    browserSync.init({
      notify: false,
      port: 8000,
      server: {
        baseDir: [ '.tmp','app'],
        routes: {
          '/bower_components': 'bower_components',
          '/node_modules':'node_modules'
        }
      }
    });

    gulp.watch([
      'app/*.html',
      'app/images/**/*',
      'app/js/**/*',
    ]).on('change', reload);

    gulp.watch('app/*.html', ['wiredep']);
    gulp.watch('app/sass/**/*.scss', ['sass']);
  });
});

gulp.task('default', function() {
  gulp.start('build');
});
