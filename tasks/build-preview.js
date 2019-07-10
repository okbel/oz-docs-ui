'use strict';

const fs = require('fs');
const path = require('path');
const fileinclude = require('gulp-file-include');
const vfs = require('vinyl-fs');
const map = require('map-stream');
const merge = require('merge-stream');
const minimatch = require('minimatch');
const handlebars = require('handlebars');
const requireFromString = require('require-from-string');

module.exports = async (src, dest, destTheme) => {
  const relativeThemePath = path.relative(dest, destTheme);

  const [layoutsIndex] = await Promise.all([
    compileLayouts(src),
    registerPartials(src),
    registerHelpers(src),
  ]);

  const sampleUiModelPath = path.resolve(
    __dirname,
    '../preview-site/sample-ui-model.json'
  );
  const sampleUiModelData = fs.readFileSync(sampleUiModelPath, 'utf8');
  const sampleUiModel = JSON.parse(sampleUiModelData.toString());

  vfs
    .src(['preview-site/**/*.html'])
    .pipe(
      map((file, next) => {
        const compiledLayout =
          layoutsIndex[file.stem === '404' ? '404.hbs' : 'default.hbs'];
        const previewSitePath = path.resolve('preview-site');
        const relativeToRoot = path.relative(file.path, previewSitePath);
        sampleUiModel['themeRootPath'] = path.join(
          relativeToRoot,
          relativeThemePath
        );
        sampleUiModel['siteRootUrl'] = path.join(relativeToRoot, 'index.html');
        sampleUiModel['contents'] = file.contents.toString();
        sampleUiModel['navigation-link-prefix'] = relativeToRoot;
        file.contents = new Buffer(compiledLayout(sampleUiModel));
        next(null, file);
      })
    )
    .pipe(vfs.dest(dest));
};

function registerPartials(src) {
  return new Promise((resolve, reject) => {
    vfs
      .src(['partials/*.hbs'], { base: src, cwd: src })
      .pipe(
        fileinclude({
          prefix: '@@',
          basepath: src,
        })
      )
      .pipe(
        map((file, next) => {
          handlebars.registerPartial(file.stem, file.contents.toString());
          next(null, file);
        })
      )
      .on('error', reject)
      .on('end', resolve);
  });
}

function registerHelpers(src) {
  return new Promise((resolve, reject) => {
    vfs
      .src(['helpers/*.js'], { base: src, cwd: src })
      .pipe(
        map((file, next) => {
          const helperFunction = requireFromString(file.contents.toString());
          handlebars.registerHelper(file.stem, helperFunction);
          next(null, file);
        })
      )
      .on('error', reject)
      .on('end', resolve);
  });
}

function compileLayouts(src) {
  const layoutsIndex = {};
  return new Promise((resolve, reject) => {
    vfs
      .src('layouts/*.hbs', { base: src, cwd: src })
      .pipe(
        map((file, next) => {
          layoutsIndex[file.basename] = handlebars.compile(
            file.contents.toString(),
            { preventIndent: true }
          );
          next(null, file);
        })
      )
      .on('error', reject)
      .on('end', () => resolve(layoutsIndex));
  });
}
