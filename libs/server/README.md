## @firebase-web-authn/server
A Firebase Extension for authentication with WebAuthn passkeys.

This package contains four tree-shakeable async methods for using FirebaseWebAuthn in a secure context.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/server?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/server)
[![Firebase Admin SDK version](https://img.shields.io/npm/dependency-version/@firebase-web-authn/server/dev/firebase-admin?label=Firebase%20Admin%20SDK&logo=firebase)](https://www.npmjs.com/package/firebase-admin)
#### Demo: https://firebase-web-authn.dev
### Methods
```ts
  backupEligible: (uid: string, app?: App) => Promise<boolean | null>;
backupSuccessful: (uid: string, app?: App) => Promise<boolean | null>;
     lastPresent: (uid: string, app?: App) => Promise<Timestamp | null>;
    lastVerified: (uid: string, app?: App) => Promise<Timestamp | null>;
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
## More packages
- [@firebase-web-authn/extension](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/extension)
- [@firebase-web-authn/browser](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/browser)
