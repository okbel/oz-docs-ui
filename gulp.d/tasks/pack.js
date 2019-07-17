'use strict';

const vfs = require('vinyl-fs');
var zip = require('gulp-vinyl-zip').zip;

module.exports = async (name, buildDir, destDir) =>
  new Promise((resolve, reject) => {
    return vfs
      .src('**/*', { base: buildDir, cwd: buildDir })
      .pipe(zip(`${name}.zip`))
      .pipe(vfs.dest(destDir))
      .on('error', reject)
      .on('end', resolve);
  });
