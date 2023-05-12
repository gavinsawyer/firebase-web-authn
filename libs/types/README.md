## @firebase-web-authn/types
A Firebase Extension for authentication with WebAuthn passkeys.

This package contains types and interfaces used internally by FirebaseWebAuthn and for implementing it in a secure context.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/types?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/types)
#### WebAuthnUserCredential
Information about the public key credential associated with the user
```ts
import { WebAuthnUserCredential } from "@firebase-web-authn/types";
```
```ts
interface WebAuthnUserCredential {
  "backupEligible": boolean,   // Whether the private key is eligible to be backed up.
  "backupSuccessful": boolean, // Whether the private key has been backed up successfully.
  "counter": number,           // Updated automatically by some browsers to help prevent replay attacks.
  "id": Uint8Array,            // ID associated with the credential.
  "publicKey": Uint8Array,     // Public key associated with the credential.
}
```
#### WebAuthnUserDocument
Document in the `webAuthnUsers` collection. This should not have read or write access from users.
```ts
import { WebAuthnUserDocument } from "@firebase-web-authn/types";
```
```ts
interface WebAuthnUserDocument {
  "challenge"?: string,                  // Only present between operations and cleaned up if the user cancels.
  "credential"?: WebAuthnUserCredential, // Information about the public key credential associated with the user.
  "lastPresent"?: Timestamp,             // Automatically updated on successful operations.
  "lastVerified"?: Timestamp,            // Automatically updated on successful operations that verified the user with biometrics.
}
```
