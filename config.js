'use strict'

const fs = require('fs')
const path = require('path')
const convict = require('convict')
const yaml = require('js-yaml')

const conf = convict({
  config_file: {
    doc: 'Location of the config file',
    format: String,
    default: 'theme.yml',
    env: 'CONFIG_FILE',
    arg: 'config-file',
  },
  source: {
    doc: 'Root path for the source files',
    format: String,
    default: __dirname,
  },
  destination: {
    doc: 'Root path for all the built files',
    format: String,
    default: null,
  },
  theme_destination: {
    doc: 'Path for the theme assets',
    format: String,
    default: null,
  },
  cache_buster: {
    doc: 'Instructs the build to add the specified cache buster query string to asset URLs',
    format: String,
    default: undefined,
    arg: 'cache-buster',
  },
  github_token: {
    doc: 'Token for Github auth',
    format: String,
    default: 'personal-access-token-with-public_repo-scope',
    env: 'GITHUB_TOKEN',
    arg: 'github-token',
  },
  repository: {
    owner: {
      doc: 'Organization name of the Github repository',
      format: String,
      default: null,
    },
    name: {
      doc: 'Project name of the Github repository',
      format: String,
      default: null,
    },
  },
  port: {
    doc: 'HTTP port used for local preview',
    format: Number,
    default: 8080,
    arg: 'port',
  },
})

const ymlFile = fs.readFileSync(conf.get('config_file')).toString()
const configFromYaml = yaml.safeLoad(ymlFile)
conf.load(configFromYaml)

module.exports = conf
