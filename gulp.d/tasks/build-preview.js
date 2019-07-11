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
const asciidoctor = require('asciidoctor.js')();

const ASCIIDOC_ATTRIBUTES = {
  experimental: '',
  icons: 'font',
  sectanchors: '',
  'source-highlighter': 'highlight.js',
};

module.exports = async (src, dest, destTheme, previewSrcDir) => {
  const relativeThemePath = path.relative(dest, destTheme);
  console.log(relativeThemePath);

  const [layoutsIndex] = await Promise.all([
    compileLayouts(src),
    registerPartials(src),
    registerHelpers(src),
  ]);

  const sampleUiModelPath = path.resolve(previewSrcDir, 'sample-ui-model.json');
  const sampleUiModelData = fs.readFileSync(sampleUiModelPath, 'utf8');
  const sampleUiModel = JSON.parse(sampleUiModelData.toString());

  console.log(
    'src, dest, destTheme, previewSrcDir -------->',
    src,
    dest,
    destTheme,
    previewSrcDir
  );

  vfs
    .src(['preview-src/**/*.adoc'])
    .pipe(
      map((file, next) => {
        const doc = asciidoctor.load(file.contents, {
          safe: 'safe',
          attributes: ASCIIDOC_ATTRIBUTES,
        });
        console.log('-------------> file', file);
        const compiledLayout =
          layoutsIndex[file.stem === '404' ? '404.hbs' : 'default.hbs'];

        const relativeToRoot = path.relative(file.path, previewSrcDir);
        sampleUiModel['themeRootPath'] = path.join(relativeToRoot, destTheme);

        console.log(sampleUiModel['themeRootPath'], relativeToRoot);

        sampleUiModel['siteRootUrl'] = path.join(relativeToRoot, 'index.html');
        sampleUiModel['contents'] = Buffer.from(doc.convert());
        sampleUiModel['navigation-link-prefix'] = relativeToRoot;
        sampleUiModel.title = doc.getDocumentTitle();
        sampleUiModel.layout = doc.getAttribute('page-layout', 'default');
        sampleUiModel.attributes = Object.entries(doc.getAttributes())
          .filter(([name, val]) => name.startsWith('page-'))
          .reduce((accum, [name, val]) => {
            accum[name.substr(5)] = val;
            return accum;
          }, {});

        file.extname = '.html';
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
          basepath: path.resolve(src, '..'),
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
