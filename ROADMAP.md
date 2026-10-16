# LicenseChain JavaScript SDK Roadmap

## Current Focus

- Keep default base URL and normalization aligned with `https://api.licensechain.app/v1`.
- Preserve browser/isomorphic support while maintaining JWT/JWKS helper parity.
- Keep `@licensechain/javascript-sdk` as the default isomorphic TypeScript/JS package.

## Next Operational Tasks

- Re-run conformance checks after Core API verify/JWKS contract updates.
- Keep docs and examples synchronized with https://docs.licensechain.app/en/sdk.
- Record release-impacting changes in `CHANGELOG.md`; develop experiments on `dev`, release from `main`.

## Ecosystem Notes

- Continue shared-core alignment with the Node.js SDK; prevent feature drift between the two packages.
- Keep migration notes clear when shared-core updates change runtime expectations.
