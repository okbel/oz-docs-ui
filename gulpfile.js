'use strict';

const path = require('path');
const gulp = require('gulp');

const config = require('./config');
const build = require('./tasks/build');
const buildPreview = require('./tasks/build-preview');
const pack = require('./tasks/pack');
const preview = require('./tasks/preview');
const release = require('./tasks/release');
const update = require('./tasks/update');
const { series, parallel } = require('gulp');

try {
  config.validate({ allowed: 'strict' });
} catch (error) {
  error.message.split('\n').forEach((message) => {
    console.error('Bad config -', message);
  });
  // 9 - Invalid Argument; see https://nodejs.org/api/process.html#process_exit_codes
  process.exit(9);
}

const src = config.get('source');
const dest = config.get('destination');
const destTheme = path.join(dest, config.get('theme_destination'));

function buildTask(done) {
  build(src, destTheme, config.get('cache_buster'));
  done();
}

function buildPreviewTask(done) {
  buildPreview(src, dest, destTheme);
  done();
}

function previewTask(done) {
  preview({ dest, port: config.get('port') });
  done();
}

exports.build = buildTask;
exports.preview = series(parallel(buildPreviewTask, buildTask), previewTask);
exports.buildPreview = buildPreviewTask;

// gulp.task('build', () => build(src, destTheme, config.get('cache_buster')));

// gulp.task('build-preview', ['build'], () => buildPreview(src, dest, destTheme));

// gulp.task('preview', ['build-preview'], () =>
//   preview({ dest, port: config.get('port') }, () => gulp.start('build-preview'))
// );

// gulp.task('pack', ['build'], () =>
//   pack({ repo: config.get('repository.name'), dest, destTheme })
// );

// gulp.task('release', ['pack'], () =>
//   release({
//     owner: config.get('repository.owner'),
//     repo: config.get('repository.name'),
//     token: config.get('github_token'),
//     dest,
//   })
// );

// gulp.task('update', () => update());
