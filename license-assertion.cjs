'use strict';

const jose = require('jose');

const LICENSE_TOKEN_USE_CLAIM = 'licensechain_license_v1';

/**
 * Node-only: RS256 license_token verification via JWKS (parity with Node SDK).
 * @param {string} token
 * @param {string} jwksUrl
 * @param {{ expectedAppId?: string, issuer?: string }} [options]
 * @returns {Promise<import('jose').JWTPayload>}
 */
async function verifyLicenseAssertionJwt(token, jwksUrl, options = {}) {
  const JWKS = jose.createRemoteJWKSet(new URL(String(jwksUrl).trim()));
  const { payload } = await jose.jwtVerify(String(token).trim(), JWKS, {
    algorithms: ['RS256'],
    ...(options.issuer ? { issuer: options.issuer } : {}),
  });
  if (payload.token_use !== LICENSE_TOKEN_USE_CLAIM) {
    throw new Error(`Invalid license token: expected token_use "${LICENSE_TOKEN_USE_CLAIM}"`);
  }
  if (
    options.expectedAppId != null &&
    options.expectedAppId !== '' &&
    payload.aud !== options.expectedAppId
  ) {
    throw new Error('Invalid license token: aud does not match expected app id');
  }
  return payload;
}

module.exports = {
  LICENSE_TOKEN_USE_CLAIM,
  verifyLicenseAssertionJwt,
};
