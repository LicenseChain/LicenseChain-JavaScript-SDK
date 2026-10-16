# LicenseChain JavaScript SDK Roadmap

## Current Focus

- Keep default base URL and normalization aligned with `https://api.licensechain.app/v1`.
- Preserve browser/isomorphic support while maintaining JWT/JWKS helper parity.
- Keep `@licensechain/javascript-sdk` as the default isomorphic TypeScript/JS package.

## Next Operational Tasks

- Re-run conformance checks after Core API verify/JWKS contract updates.
- Keep docs and examples synchronized with https://docs.licensechain.app/en/sdk.
- Record release-impacting changes in `CHANGELOG.md`; develop experiments on `dev`, release from `main`.


## Active Milestone (2026-10-16)

- **Conformance re-run**: workspace `sdk-conformance` validate reports `errors=0` (remaining WARN = optional README PATCH license lifecycle aliases; DELETE/update paths cover revoke).
- **Docs sync**: README points at `https://docs.licensechain.app/en/sdk`; default API base documented as `https://api.licensechain.app/v1`.
- **Branch opsec**: land experiments on `dev`; promote to `main` only for release-ready changes.

## Ecosystem Notes

- Continue shared-core alignment with the Node.js SDK; prevent feature drift between the two packages.
- Keep migration notes clear when shared-core updates change runtime expectations.
