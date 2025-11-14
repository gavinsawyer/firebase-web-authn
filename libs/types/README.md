## @firebase-web-authn/types
A Firebase Extension for authentication with WebAuthn passkeys.

This package contains types and interfaces used internally by FirebaseWebAuthn and for implementing it in a secure context.

[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/types?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/types)
[![Firebase Admin SDK version](https://img.shields.io/npm/dependency-version/@firebase-web-authn/types/firebase-admin?label=Firebase%20SDK%20for%20Cloud%20Functions&logo=firebase)](https://www.npmjs.com/package/firebase-functions)
### WebAuthnUserDocument
Document in the `users` collection of the `ext-firebase-web-authn` Firestore Database

**(This should not have read or write access from users.)**
```ts
import { WebAuthnUserDocument } from "@firebase-web-authn/types";
```
```ts
interface WebAuthnUserDocument {
  "challenge"?:           string;                       // Only present between operations and cleaned up if the user cancels.
  "credentials"?:         {                             // An object of "first" and "second" WebAuthnUserCredentials with either being null if not found.
    [key in WebAuthnUserCredentialFactor]: WebAuthnUserCredential | null
  };
  "lastCredentialUsed"?:  WebAuthnUserCredentialFactor; // The last credential successfully authenticated given as WebAuthnUserCredentialFactor.
  "lastPresent"?:         Timestamp;                    // Automatically updated on successful operations.
  "lastVerified"?:        Timestamp;                    // Automatically updated on successful operations that verified the user with biometrics.
  "lastWebAuthnProcess"?: WebAuthnProcess;              // The last WebAuthnProcess successfully completed by the user..
}
```
### WebAuthnUserCredential
Information about the public key credential associated with the user
```ts
import { WebAuthnUserCredential } from "@firebase-web-authn/types";
```
```ts
export interface WebAuthnUserCredential {
  "authenticatorAttachment": AuthenticatorAttachment; // The AuthenticatorAttachment associated with the credential.
  "backedUp":                boolean;                 // Whether the credential has been backed up successfully.
  "counter":                 number;                  // Updated automatically by some authenticators to help prevent replay attacks.
  "id":                      Uint8Array;              // ID associated with the credential.
  "publicKey":               Uint8Array;              // Public key associated with the credential.
}
```
### WebAuthnUserCredentialFactor
The authentication factor associated with the credential
```ts
import { WebAuthnUserCredentialFactor } from "@firebase-web-authn/types";
```
```ts
type WebAuthnUserCredentialFactor = "first" | "second"
```
### WebAuthnProcess
The WebAuthn process associated with operations and related cryptographic challenges
```ts
import { WebAuthnProcess } from "@firebase-web-authn/types";
```
```ts
type WebAuthnProcess = "authentication" | "reauthentication" | "registration"
```
## More packages
- [@firebase-web-authn/extension](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/extension)
- [@firebase-web-authn/browser](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/browser)
- [@firebase-web-authn/server](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/server)
