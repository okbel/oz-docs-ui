'use strict';

const path = require('path');

const vfs = require('vinyl-fs');
const map = require('map-stream');
const merge = require('merge-stream');
const minimatch = require('minimatch');

const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const uglify = require('gulp-uglifyes');
const runSequence = require('run-sequence');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const replace = require('gulp-replace');

const config = require('./../../config');
const src = config.get('source');
const dest = config.get('destination');
const destTheme = path.join(dest, config.get('theme_destination'));
const sassDir = 'stylesheets/**/*.scss';
const sassSrc = 'stylesheets/index.scss';
const sassDist = 'build/_theme/stylesheets';

module.exports = function build(src, dest, cacheBuster) {
  const srcOptions = { base: src, cwd: src };

  return merge([
    vfs.src('images/**/*.{svg,png}', srcOptions).pipe(imagemin()),

    vfs
      .src('scripts/{0..9}{0..9}-*.js', srcOptions)
      // .pipe(uglify())
      .pipe(concat('scripts/site.js')),

    vfs.src('scripts/*.pack.js', srcOptions),

    vfs.src('fonts/*.{woff,woff2}', srcOptions),

    vfs
      .src('stylesheets/index.scss', srcOptions)
      .pipe(sass().on('error', sass.logError))
      .pipe(
        autoprefixer({
          browsers: ['last 2 versions'],
          remove: false,
        })
      )
      .on('error', function(err) {
        console.log(err.message);
      }),

    // vfs.src('node_modules/typeface-*/**/*.{svg,eot,woff,woff2}', srcOptions)
    //  .pipe(map((file, next) => {
    //    // move font files to fonts (without any subfolder)
    //    file.dirname = path.join(file.base, 'fonts')
    //    next(null, file)
    //  })),

    vfs.src('helpers/*.js', srcOptions),
    vfs.src('layouts/*.hbs', srcOptions),
    // .pipe(replace(/(\.css)(?=">)/g, cacheBuster ? '$1?' + cacheBuster : '$1')),
    vfs
      .src('partials/*.hbs', srcOptions)
      .pipe(replace(/(\.js)(?=">)/g, cacheBuster ? '$1?' + cacheBuster : '$1')),
  ]).pipe(vfs.dest(dest));
};
