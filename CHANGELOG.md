# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Fixed Jest under Node 24+ for ESM-only `jose` by enabling `--experimental-vm-modules` in the test script.

- Switched Rollup to `@rollup/plugin-typescript` so TypeScript builds on CI; regenerated `package-lock.json` for `npm ci`.
- Pinned vulnerable transitive floors (`serialize-javascript`, `minimatch`, `js-yaml`, `brace-expansion`) and upgraded the ESLint toolchain.
- Jest unit tests load CJS `dist` against ESM-only `jose` via `NODE_OPTIONS=--experimental-vm-modules` (Node 20+).

## [1.0.3] - 2026-10-11

- Fixed npm badge URL encoding for `@licensechain/javascript-sdk`; removed broken Bundlephobia badge.
- Corrected homepage and install/import snippets to the scoped package name and docs.licensechain.app/en/sdk.

## [1.0.2] - 2026-10-10

- Relicensed public surface under Elastic License 2.0 (ELv2).
- Raised `engines.node` from `>=14` to `>=20`; CI matrix Node 20 / 22 / 24.
- Added Dependabot for npm and GitHub Actions.
- Root exports for license-assertion JWT helpers with `jose` marked external in Rollup; `license-assertion.cjs` re-exports for back-compat.

## [1.0.0] - 2026-04-06

- Initial public SDK surface with repository documentation kit.
- Positioned as the isomorphic TypeScript/JS package alongside the Node.js SDK shared-core track.
