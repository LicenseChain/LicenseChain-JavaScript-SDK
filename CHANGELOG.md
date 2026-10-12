# Changelog

## [1.0.3] - 2026-10-11

- Fixed npm badge URL encoding for `@licensechain/javascript-sdk`; removed broken Bundlephobia badge.
- Corrected homepage and install/import snippets to the scoped package name and docs.licensechain.app/en/sdk.

## [1.0.2] - 2026-10-10

- Relicensed public surface under Elastic License 2.0 (ELv2).
- Raised `engines.node` from `>=14` to `>=20`; CI matrix now Node 20 / 22 / 24.
- Added Dependabot for npm and GitHub Actions.

All notable changes to this SDK are documented in this file.


## [1.0.2] - 2026-10-10

- Public SDK surface licensed under Elastic License 2.0 (ELv2).
- Repository hygiene confirmed: ROADMAP.md, CHANGELOG.md, and .gitignore present for contributor onboarding.
- Documented Elastic-2.0 package metadata follow-up for scoped npm package publishing readiness (manual npm publish still required).

## [Unreleased]

- Root exports: `verifyLicenseAssertionJwt`, `LICENSE_TOKEN_USE_CLAIM`, and `VerifyLicenseAssertionOptions` — parity with `licensechain-node-sdk` (`src/license-assertion.ts`). Rollup marks `jose` as external for CJS/ESM. `license-assertion.cjs` re-exports from `dist/index.js` for back-compat.

## 2026-04-06

- Added repository-level `ROADMAP.md` and `CHANGELOG.md` for SDK workspace doc-gap conformance.
- Captured JavaScript SDK consolidation posture with shared JavaScript/Node core governance.
