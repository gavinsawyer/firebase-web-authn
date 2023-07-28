## @firebase-web-authn/types
A Firebase Extension for authentication with WebAuthn passkeys.

This package contains types and interfaces used internally by FirebaseWebAuthn and for implementing it in a secure context.

[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/types?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/types)
[![Firebase Admin SDK version](https://img.shields.io/npm/dependency-version/@firebase-web-authn/types/dev/firebase-admin?label=Firebase%20SDK%20for%20Cloud%20Functions&logo=firebase)](https://www.npmjs.com/package/firebase-functions)
### WebAuthnUserCredential
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
### WebAuthnUserDocument
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
## More packages
- [@firebase-web-authn/extension](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/extension)
- [@firebase-web-authn/browser](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/browser)
- [@firebase-web-authn/server](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/server)
