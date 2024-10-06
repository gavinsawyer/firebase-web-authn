# FirebaseWebAuthn
A Firebase Extension for authentication with WebAuthn passkeys.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
[![Latest version in NPM](https://img.shields.io/npm/v/@firebase-web-authn/extension?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/extension)
[![Install](https://img.shields.io/static/v1?label=&message=Install%20in%20Firebase%20console&logo=firebase&color=blue)](https://console.firebase.google.com/u/0/project/_/extensions/install?ref=gavinsawyer%2Ffirebase-web-authn)

## v10.4.2

- Removed `firebaseauth.viewer` role from extension to fix CLI install issue. Previously only used to appear in Auth category in the Firebase Extensions Hub.
- Updated deps.
- Fixed webAuthn support detection in demo.

## v10.4.1

- Reverted to SimpleWebAuthn^9.

## v10.4.0

- Added `Relying Party ID` parameter to expand support to mobile apps without a domain or increased passkey scope.

## v10.3.7

- Improved build process, fixed "dirty" deployment.
- Updated dependencies.

## v10.3.6

- Added explicit ".js" extensions in main and index files.

## v10.3.5

- Updated dependencies.

## v10.3.3

- Added descriptions in package.json files.
- Fixed robots.txt in demo website to allow bots.
- Updated dependencies.

## v10.3.2

- Fixed issue with FIDO AppID extension in Chrome. (Fixes #10)
- Upgraded demo website to Angular 17.
- Updated dependencies.
- Removed legacy AngularFire dependency.

## v10.3.1

- Fixed API issue with inadequate error handling on creating custom tokens after credentials are already stored.
- Updated dependencies.
- Improved demo website.

## v10.3.0

- Implemented second (2FA) factor passkeys with changes to several packages. (Fixes #3).
- Improved docs and TSDocs/type-safety.
- Updated dependencies.
- BREAKING CHANGES: Deprecated some server library methods to better reflect WebAuthn spec, Changed structure of credentials in Firestore. Clear user database or create a migration script if proceeding.
- Rearranged extension parameters and added "any" authenticator attachment option.
- Moved to 2nd Gen Cloud Function for API ahead of support.
- Improved demo website.
- Renamed API operation `clear user doc` to `clear credential`, added support for clearing backup credentials.
- Added more security surrounding challenge by storing expected `process` ("authentication", "registration", etc.) and `processingCredential` ("first" or "second") alongside challenge value.
- Separated function responses by operation in API.

## v10.2.2

- Updated dependencies to include firebase-tools@^12.5.3 with support for extension version numbers ≥10.
- Fixed some documentation.
- Improved linting.

## v10.2.1

- Updated docs to reflect breaking changes in 10.2.0.
- Updated demo to use composition for routes, to eliminate constructor usage, and to fix reactive user value error.
- Simplified demo SignInCardComponent, RxJS usage in services.
- Added favicon to demo.
- Formatting

## v10.2.0

- BREAKING CHANGE: Moved to separate Firestore Database with ID `ext-firebase-web-authn`.

## v10.1.6

- Fixed mismatched collection reference in server package.

## v10.1.5

- Fixed issues with error catcheing in browser and api.

## v10.1.4

- Fixed build issue.

## v10.1.3

- Working demo using @angular/fire-canary
- Improved demo project structure
- Removed redundant config
- TS file naming convention now mirrors export names except for main and index files: ProfileCardComponent.ts contains a component class, GIT_INFO.ts contains an injection token, backupSuccessful.ts contains a constant, etc. Directories are all lowercase and use spaces.

## v10.1.2

- Moved to SimpleWebAuthn v8
- Reversed breaking changes in 10.1.0
- Build improvements
- TSDoc improvements

## v10.1.0

- Breaking changes: Now using separate database `firebase-web-authn`.
- Feat: credential method in server package.
- Updated documentation.
- Updated dependencies.

## v10.0.0

- Updated dependencies.
- Moved to v10 to reflect compatibility with Firebase JavaScript SDK v10.
- Added provideClientHydration() to website.
- Fixes #7

## v9.6.6

- Fixes #4: Malformed FirebaseWebAuthnError

## v9.6.5

- Documentation, CI/CD fixes

## v9.6.4

- Fixed breaking dependency issue

## v9.6.3

- Updated dependencies
- Fixed breaking dependency issue with updates to Nx configuration

## v9.6.0

- Updated dependencies
- Renamed a package "api"

## v9.5.3

- Updated dependencies
- Documentation

## v9.5.2

- Updated dependencies
- Documentation

## v9.5.1

- Updated copy in extension description for keywords "passkey," "biometrics."
- Documentation

## v9.5.0

- Added a server library with four methods to check when a user was last present or verified, whether their passkey is eligible to be backed up, or whether their passkey is successfully backed up.
- Added optional app parameter to getFirebaseWebAuthnAPI method in functions library.
- Updated dependencies
- Documentation

## v9.4.23

- Incremented version ;_;

## v9.4.22

- Exported missing WebAuthnUserCredential from types library.
- Added package-lock.json in extensions dist root.
- Updated dependencies.

## v9.4.21

- Updated services to use Signals.
- Updated dependencies

## v9.4.20

- Removed explicit `Service Account Token Creator` role from extension.
- Documentation

## v9.4.19

- Updated dependencies
- Documentation

## v9.4.18

- Updated dependencies
- Documentation

## v9.4.17

- Updated dependencies
- Documentation
- CI fix for single package missing version bump

## v9.4.16

- Added package-lock.json for Extensions Hub
- Updated dependencies
- Documentation

## v9.4.15

- Added icon

## v9.4.14

- Updated dependencies (Angular, Nx 16; firebase-tools 12)

## v9.4.13

- Documentation for installation from Firebase directly

## v9.4.12

- Fixed source and release notes URLs in extension.yaml

## v9.4.11

- Commiting extension dist for Firebase Extensions Hub

## v9.4.10

- Documentation
