# Changelog

All notable changes to this SDK are documented in this file.

## [Unreleased]

- Root exports: `verifyLicenseAssertionJwt`, `LICENSE_TOKEN_USE_CLAIM`, and `VerifyLicenseAssertionOptions` — parity with `licensechain-node-sdk` (`src/license-assertion.ts`). Rollup marks `jose` as external for CJS/ESM. `license-assertion.cjs` re-exports from `dist/index.js` for back-compat.

## 2026-04-06

- Added repository-level `ROADMAP.md` and `CHANGELOG.md` for SDK workspace doc-gap conformance.
- Captured JavaScript SDK consolidation posture with shared JavaScript/Node core governance.
