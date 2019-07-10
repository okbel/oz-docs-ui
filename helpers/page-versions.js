'use strict'

// FIXME the UI model should be prepopulated with this collection
module.exports = (domains, domainName, otherPageVersions) => {
  const domain = domains.find((candidate) => candidate.name === domainName), pageVersions = []
  domain.versions.forEach((domainVersion) => {
    const pageVersion = otherPageVersions.find((candidate) => candidate.string === domainVersion.string)
    pageVersions.push(pageVersion ? pageVersion : Object.assign({ missing: true }, domainVersion))
  })

  return pageVersions
}
