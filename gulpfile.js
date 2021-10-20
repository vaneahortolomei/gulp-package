//Files
let projectFolder = "dist";
let sourceFolder = "src";

//path
let path = {
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/css/",
    js: projectFolder + "/js/",
    img: projectFolder + "/img/",
    fonts: projectFolder + "/fonts/"
  },
  src: {
    html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
    css: sourceFolder + "/scss/style.scss",
    js: sourceFolder + "/js/script.js",
    img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: sourceFolder + "/fonts/*.ttf",
  },
  watch: {
    html: sourceFolder + "/**/*.html",
    css: sourceFolder + "/scss/**/*.scss",
    js: sourceFolder + "/js/**/*.js",
    img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: "./" + projectFolder + "/"
};

//variables

let {src, dest} = require("gulp"),
    gulp = require("gulp"),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass")(require("sass"));
    autoprefixer = require("gulp-autoprefixer");
    group_media = require("gulp-group-css-media-queries");
    clean_css = require("gulp-clean-css");
    rename = require("gulp-rename");
    uglify = require("gulp-uglify-es").default;
    imagemin = require("gulp-imagemin");
    webp = require("gulp-webp");
    webp_html = require("gulp-webp-html");
    webp_css = require("gulp-webpcss");
    svg_sprite = require("gulp-svg-sprite");

function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./" + projectFolder + "/"
    },
    port: 3000,
    notify: false
  })
}

function images() {
  return src(path.src.img)
      .pipe(
          webp({
            quality: 70
          })
      )
      .pipe(dest(path.build.img))
      .pipe(src(path.src.img))
      .pipe(
          imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3
          })
      )
      .pipe(dest(path.build.img))
      .pipe(browsersync.stream())
}


function html() {
  return src(path.src.html)
      .pipe(fileinclude())
      .pipe(webp_html())
      .pipe(dest(path.build.html))
      .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)
      .pipe(fileinclude())
      .pipe(dest(path.build.js))
      .pipe(uglify())
      .pipe(rename({
            extname: ".min.js"
          })
      )
      .pipe(dest(path.build.js))
      .pipe(browsersync.stream())
}


function css() {
  return src(path.src.css)
      .pipe(
          scss({
            outputStyle: "expanded"
          })
      )
      .pipe(group_media())
      .pipe(autoprefixer({
            overrideBrowserslist: ["last 10 versions"],
            cascade: true,
          })
      )
      .pipe(webp_css())
      .pipe(dest(path.build.css))
      .pipe(clean_css())
      .pipe(rename({
            extname: ".min.css"
          })
      )
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
}

//svg sprite build
gulp.task('svg_sprite', function () {
  return gulp.src([sourceFolder + "/iconsrpite/*.svg"])
      .pipe(svg_sprite({
            mode: {
              stack: {
                sprite: "../icons/icons.svg",
                example: true,
              }
            }
          })
      )
      .pipe(dest(path.build.img))
});

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

function clean() {
  return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(images, js, css, html));
let watch = gulp.parallel(build, browserSync, watchFiles);


exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
