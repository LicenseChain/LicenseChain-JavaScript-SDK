'use strict';

/**
 * Back-compat: same helpers as package root (`verifyLicenseAssertionJwt`, `LICENSE_TOKEN_USE_CLAIM`).
 * Prefer `import { verifyLicenseAssertionJwt } from '@licensechain/javascript-sdk'` or destructuring from `require('@licensechain/javascript-sdk')`.
 */
const mod = require('./dist/index.js');

module.exports = {
  LICENSE_TOKEN_USE_CLAIM: mod.LICENSE_TOKEN_USE_CLAIM,
  verifyLicenseAssertionJwt: mod.verifyLicenseAssertionJwt,
};
