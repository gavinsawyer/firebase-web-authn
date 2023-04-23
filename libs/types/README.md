## @firebase-web-authn/types
A Firebase extension for authentication with WebAuthn passkeys.

This package contains types used internally by FirebaseWebAuthn as well as `WebAuthnUserDocument`.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/types?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/types)
```ts
import { WebAuthnUserDocument } from "@firebase-web-authn/types";
```
```ts
export interface WebAuthnUserDocument {
  "challenge"?: string, // Only present between operations and cleaned up if the user cancels.
  "credential"?: {
    "backedUp": boolean,
    "counter": number, // Updated by some browsers and tracked by FirebaseWebAuthn automatically.
    "deviceType": "singleDevice" | "multiDevice",
    "id": Uint8Array,
    "publicKey": Uint8Array,
  },
  "lastPresent"?: Timestamp,  // Automatically updated on successful operations.
  "lastVerified"?: Timestamp, // Automatically updated on successful operations that verified the user with biometrics.
}
```
