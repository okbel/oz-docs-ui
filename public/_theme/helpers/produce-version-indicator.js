'use strict'

module.exports = (domain) => domain.versioned ? ` (${domain.version.string})` : ''
