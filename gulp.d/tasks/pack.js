'use strict'

const vfs = require('vinyl-fs')
const zip = require('gulp-vinyl-zip')

module.exports = async ({ repo, dest, destTheme }) =>
  new Promise((resolve, reject) => {
    vfs
      .src('**/*', { base: destTheme, cwd: destTheme })
      .pipe(zip.zip(`${repo}-local.zip`))
      .pipe(vfs.dest(dest))
      .on('error', reject)
      .on('end', resolve)
  })
