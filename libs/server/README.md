## @firebase-web-authn/server
A Firebase Extension for authentication with WebAuthn passkeys.

This package contains six tree-shakeable async methods for using FirebaseWebAuthn in a secure context.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/server?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/server)
[![Firebase Admin SDK version](https://img.shields.io/npm/dependency-version/@firebase-web-authn/server/firebase-admin?label=Firebase%20Admin%20SDK&logo=firebase)](https://www.npmjs.com/package/firebase-admin)
#### Demo: https://firebase-web-authn.dev
### Methods
```ts
         credentials: (uid: string, app?: App) => Promise<{ [key in WebAuthnUserCredentialFactor]: WebAuthnUserCredential | null }>;
  lastCredentialUsed: (uid: string, app?: App) => Promise<WebAuthnUserCredentialFactor | null>;
         lastPresent: (uid: string, app?: App) => Promise<Timestamp | null>;
        lastVerified: (uid: string, app?: App) => Promise<Timestamp | null>;
 lastWebAuthnProcess: (uid: string, app?: App) => Promise<WebAuthnProcess | null>;
webAuthnUserDocument: (uid: string, app?: App) => Promise<WebAuthnUserDocument | null>;
```
Designed to be used within Firebase Functions or another secure context with access to Firestore to check users' status with FirebaseWebAuthn:
```ts
import { getApps, initializeApp } from "firebase-admin/app";
import { lastVerified }           from "@firebase-web-authn/server";
```
```ts
getApps().length === 0 && initializeApp();

// If the user was verified within the past 30 seconds, proceed. Otherwise, ask for reverification:
(await lastVerified(user.uid))?.seconds > (Date.now() / 1000) - 30 ?
  proceed() :
  askForReverification();
```
If your check involves multiple pieces of data from `WebAuthnUserDocument`, use the `webAuthnUserDocument` method to reduce Firestore calls:
```ts
// If the user was verified with their first-factor credential within the past 30 seconds, proceed. Otherwise, ask for reverification:
(await webAuthnUserDocument(user.uid).then<boolean>(
  (webAuthnUserDocument: WebAuthnUserDocument): boolean => webAuthnUserDocument.lastVerified > (Date.now() / 1000) - 30 && webAuthnUserDocument.lastCredentialUsed === "first",
)) ?
  proceed() :
  askForReverification();
```
## More packages
- [@firebase-web-authn/extension](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/extension)
- [@firebase-web-authn/browser](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/browser)
