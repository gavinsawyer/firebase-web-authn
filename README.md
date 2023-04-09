# FirebaseWebAuthn
An unofficial Firebase extension for authentication with WebAuthn passkeys.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
#### Demo: https://firebase-web-authn.dev
## [@firebase-web-authn/browser](libs/browser)
This package contains five tree-shakeable async methods for using FirebaseWebAuthn in components and a strongly-typed error object.

[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/browser?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/browser)
[![Firebase version](https://img.shields.io/npm/dependency-version/@firebase-web-authn/browser/firebase?logo=firebase)](https://www.npmjs.com/package/firebase)
### Methods
```ts
createUserWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential>;
    signInWithPasskey: (auth: Auth, functions: Functions)               => Promise<UserCredential>;
      linkWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential>;
        unlinkPasskey: (auth: Auth, functions: Functions)               => Promise<void>;
verifyUserWithPasskey: (auth: Auth, functions: Functions)               => Promise<void>;
```
Designed to be used like the Firebase JavaScript API (version 9):
```ts
import { createUserWithEmailAndPassword } from "firebase/auth" | "@angular/fire/auth";
import { createUserWithPasskey }          from "@firebase-web-authn/browser";
```
```ts
class SignUpComponent {

  constructor(
    private readonly auth: Auth,
    private readonly functions: Functions,
  ) {
    // Firebase | AngularFire usage
    this
      .createUserWithEmailAndPassword = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password)
      .then(() => void(0));

    // FirebaseWebAuthn usage
    this
      .createUserWithPasskey = (name: string) => createUserWithPasskey(auth, functions, name)
      .then(() => void(0));

  }

  public readonly createUserWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  public readonly createUserWithPasskey: (name: string) => Promise<void>;

}
```
Add `.catch((err: FirebaseWebAuthnError): void => console.error(err))` to these methods for a detailed error object with a `code`, `message`, `method`, and/or `operation`. `method` is present for Firebase errors, and `operation` is present on all errors except Firebase errors from Auth methods:
```ts
import { FirebaseWebAuthnError } from "@firebase-web-authn/browser";
```
```ts
class FirebaseWebAuthnError extends Error {
  code: `firebaseWebAuthn/${FirebaseError["code"] | "missing-auth" | "missing-user-doc" | "no-op" | "not-verified" | "user-doc-missing-challenge-field" | "user-doc-missing-passkey-fields" | "cancelled" | "invalid"}`;
  message: FirebaseError["message"] | "No user is signed in." | "No user document was found in Firestore." | "No operation is needed." | "User not verified." | "User doc is missing challenge field from prior operation." | "User doc is missing passkey fields from prior operation.";
  method?: "httpsCallableFromURL" | "signInAnonymously" | "signInWithCustomToken";
  operation?: "clear challenge" | "clear user doc" | "create authentication challenge" | "create reauthentication challenge" | "create registration challenge" | "verify authentication" | "verify reauthentication" | "verify registration";
}
```
### Caveats
- Your backend security logic should depend on the `lastPresent` and `lastVerified` fields in the user's document in the `webAuthnUsers` collection in Firestore which are updated automatically on sign-in and verification. See [User Presence vs User Verification](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html).
- The `name` parameter is not stored automatically except in the passkey. Changes made to this value in a passkey manager are not detectable by the app.
  - If FirebaseWebAuthn is configured as an MFA provider, pass the existing identifier.
  - If FirebaseWebAuthn is your only auth provider, you can pass any recognizable value. If you expect users to have multiple usernameless accounts, `name` can be a user-generated account name ("Personal"/"Business"/etc.) or a randomized name. With generic `name` values consider passing something like "${firstName} | Personal" for users who share a passkey manager with others.
- An anonymous user linked with a passkey is the same as a user created with `createUserWithPasskey`, and appears in Firebase as having no identifier and no provider. Users created this way are not deleted after 30 days with auto clean-up.
- When using `createUserWithPasskey`, you will find that no `onAuthStateChanged` callback fires when converting an anonymous account to a providerless account. Your callback should be passed to `onIdTokenChanged` instead.
## [@firebase-web-authn/functions](libs/functions)
This package contains a Firebase Function that registers and authenticates WebAuthn passkeys, manages public key credentials in Firestore, and cleans up data if the user cancels a process or unlinks a passkey.

[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/functions?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/functions)
[![Firebase-Functions version](https://img.shields.io/npm/dependency-version/@firebase-web-authn/functions/firebase-functions?logo=firebase)](https://www.npmjs.com/package/firebase-functions)
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
  authenticatorAttachment?: AuthenticatorAttachment,         // Passing "cross-platform" only allows security keys. Passing "platform" only allows passkey managers in the user's cloud or browser.
  relyingPartyName: string,                                  // Your app's display name in the passkey popup on some platforms.
  userVerificationRequirement?: UserVerificationRequirement, // Whether to require user verification. "preferred" is default.
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
## [@firebase-web-authn/types](libs/types)
This package contains types used internally by FirebaseWebAuthn.

[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/types?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/types)
