'use strict';

const path = require('path');
const createTask = require('./gulp.d/lib/create-task');
const exportTasks = require('./gulp.d/lib/export-tasks');

const config = require('./config');
const build = require('./tasks/build');
const buildPreview = require('./tasks/build-preview');
const { series, parallel } = require('gulp');

const { reload: livereload } =
  process.env.LIVERELOAD === 'true' ? require('gulp-connect') : {};
const serverConfig = { host: '0.0.0.0', port: 5252, livereload };

const src = config.get('source');
const dest = config.get('destination');
const destTheme = path.join(dest, config.get('theme_destination'));

const task = require('./gulp.d/tasks');
const glob = {
  all: [src, dest],
  css: `${src}/css/**/*.css`,
  js: ['gulpfile.js', 'gulp.d/**/*.js', `${src}/{helpers,js}/**/*.js`],
};
const buildPreviewPagesTask = createTask({
  name: 'preview:build-pages',
  call: () => buildPreview(src, dest, destTheme),
});

const buildTask = createTask({
  name: 'build',
  desc: 'Build and stage the UI assets for bundling',
  call: () => build(src, destTheme, config.get('cache_buster')),
});

const previewBuildTask = createTask({
  name: 'preview:build',
  desc: 'Process and stage the UI assets and generate pages for the preview',
  call: series(buildTask, buildPreviewPagesTask),
});

const previewServeTask = createTask({
  name: 'preview:serve',
  call: task.serve(dest, serverConfig, () => watch(glob.all, previewBuildTask)),
});

const previewTask = createTask({
  name: 'preview',
  desc: 'Generate a preview site and launch a server to view it',
  call: series(previewBuildTask, previewServeTask),
});

module.exports = exportTasks(previewBuildTask);
// function buildTask(cb) {
//   build(src, destTheme, config.get('cache_buster'));
//   cb();
// }

// function buildPreviewTask(cb) {
//   buildPreview(src, dest, destTheme);
//   cb();
// }

// function previewTask(cb) {
//   preview({ dest, port: config.get('port') });
//   cb();
// }

// const previewBuildTask = function previewTask(cb) {
//   preview({ dest, port: config.get('port') });
//   cb();
// }
//   call: ,
// })

// exports.build = buildTask;
// exports.buildPreview = buildPreviewTask;
// exports.preview = series(previewBuildTask, previewServeTask);

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
