const { series, parallel, watch } = require('gulp');
const createTask = require('./gulp.d/lib/create-task');
const exportTasks = require('./gulp.d/lib/export-tasks');

const config = require('./config');
const build = require('./gulp.d/tasks/build');
const buildPreview = require('./gulp.d/tasks/build-preview');

const bundleName = 'ui';
const buildDir = 'build';
const previewSrcDir = 'preview-src';
const previewDestDir = 'public';
const srcDir = 'src';
const destDir = `${previewDestDir}/`;
const { reload: livereload } =
  process.env.LIVERELOAD === 'true' ? require('gulp-connect') : {};
const serverConfig = { host: '0.0.0.0', port: 5252, livereload };
const destTheme = '_theme';

const task = require('./gulp.d/tasks');
const glob = {
  all: [srcDir, previewSrcDir],
	css: `${srcDir}/stylesheets/**/*.scss`,
  js: ['gulpfile.js', 'gulp.d/**/*.js', `${srcDir}/{helpers,scripts}/**/*.js`],
};

const buildPreviewPagesTask = createTask({
  name: 'preview:build-pages',
  call: () => buildPreview(srcDir, destDir, destTheme, previewSrcDir),
});

const buildTask = createTask({
  name: 'build',
  desc: 'Build and stage the UI assets for bundling',
  call: () =>
    build(
      srcDir,
      `${destDir}${destTheme}`,
      process.argv.slice(2).some((name) => name.startsWith('preview'))
    ),
});

const previewBuildTask = createTask({
  name: 'preview:build',
  desc: 'Process and stage the UI assets and generate pages for the preview',
  call: series(buildTask, buildPreviewPagesTask),
});


const previewServeTask = createTask({
  name: 'preview:serve',
  call: task.serve(previewDestDir, serverConfig, () => watch(glob.all, previewBuildTask)),
});

const previewTask = createTask({
  name: 'preview',
  desc: 'Generate a preview site and launch a server to view it',
  call: series(previewBuildTask, previewServeTask),
});

module.exports = exportTasks(
  previewBuildTask,
  previewTask,
  previewServeTask,
  buildTask,
  buildPreviewPagesTask
);

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
