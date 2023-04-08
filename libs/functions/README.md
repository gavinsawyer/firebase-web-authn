## @firebase-web-authn/functions
An unofficial Firebase extension for authentication with WebAuthn passkeys.

This package contains a Firebase Function that registers and authenticates WebAuthn passkeys, manages public key credentials in Firestore, and cleans up data if the user cancels a process or unlinks a passkey.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/functions?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/functions)
[![Firebase-Functions version](https://img.shields.io/npm/dependency-version/@firebase-web-authn/functions/firebase-functions?logo=firebase)](https://www.npmjs.com/package/firebase-functions)
#### Demo: https://firebase-web-authn.dev
### Deployment
From your Firebase Functions package root, run:

`% npm install @firebase-web-authn/functions --save`

Export the function from your `functions/index.ts` file by calling `getFirebaseWebAuthn` with a config object.
```ts
import { initializeApp }       from 'firebase-admin/app';
import { HttpsFunction }       from "firebase-functions";
import { getFirebaseWebAuthn } from '@firebase-web-authn/functions';


initializeApp();

export const firebaseWebAuthn: HttpsFunction = getFirebaseWebAuthn({
  authenticatorAttachment: "platform",
  relyingPartyName: "FirebaseWebAuthn Demo",
  userVerificationRequirement: "required",
});

// Other functions...
```
```ts
interface FirebaseWebAuthnConfig {
  authenticatorAttachment?: AuthenticatorAttachment,         // Whether to allow platform passkeys (stored in browser and/or cloud).
  relyingPartyName: string,                                  // Your app's display name in the passkey popup on some platforms.
  userVerificationRequirement?: UserVerificationRequirement, // Whether to require user verification.
}
```
Deploy your Firebase Functions:

`% firebase deploy --only functions`

Public keys are stored in the `webAuthnUsers` collection in Firestore. Setup doesn't require you to modify any Firestore rules. Your app should use a separate `users`/`profiles` collection to store user information.
### Usage
For the browser to reach FirebaseWebAuthn, modify your `firebase.json` to include a rewrite on each app where you'd like to use passkeys.
```json
{
  "hosting": [
    {
      "target": "...",
      "rewrites": [
        {
          "source": "/firebaseWebAuthn",
          "function": "firebaseWebAuthn"
        }
      ]
    }
  ]
}
```
### Google Cloud setup
- Enable the Anonymous authentication provider in Firebase.
- Grant the `Service Account Token Creator` role to the `App Engine default service account` principal in [Service accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) under `App Engine default service account` > Permissions.
- Grant the `Cloud Functions Invoker` role to the `allUsers` principal in [Cloud Functions](https://console.cloud.google.com/functions/list) under `firebaseWebAuthn` > Permissions.
