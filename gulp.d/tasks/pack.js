'use strict';

const vfs = require('vinyl-fs');
const zip = require('gulp-vinyl-zip');

module.exports = async (name, dest, destTheme) =>
  new Promise((resolve, reject) => {
    console.log(dest);
    vfs
      .src('**/*', { base: destTheme, cwd: destTheme })
      .pipe(zip.zip(`${name}.zip`))
      .pipe(vfs.dest(dest))
      .on('error', reject)
      .on('end', resolve);
  });
