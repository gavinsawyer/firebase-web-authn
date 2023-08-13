# FirebaseWebAuthn
A Firebase Extension for authentication with WebAuthn passkeys.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
[![Latest version in NPM](https://img.shields.io/npm/v/@firebase-web-authn/extension?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/extension)
[![Install](https://img.shields.io/static/v1?label=&message=Install%20in%20Firebase%20console&logo=firebase&color=blue)](https://console.firebase.google.com/u/0/project/_/extensions/install?ref=gavinsawyer%2Ffirebase-web-authn)

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
