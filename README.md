# FirebaseWebAuthn
A Firebase Extension for authentication with WebAuthn passkeys.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
[![View in Extensions Hub](https://img.shields.io/static/v1?label=&message=View%20in%20Extensions%20Hub&logo=firebase)](https://extensions.dev/extensions/gavinsawyer/firebase-web-authn)
#### Demo: https://firebase-web-authn.dev

### Thesis
WebAuthn enables creating an account or signing in with as few as two clicks and doesn't ask the user to remember anything. This extension addresses a [popular feature request](https://github.com/firebase/firebase-js-sdk/issues/2123) for WebAuthn support in Firebase sites. Features include creating and signing in users with passkeys, linking and unlinking existing users to passkeys, and prompting signed-in users with a biometric verification request. Your site will also securely be able to tell when a user was verified last with biometrics.
## [@firebase-web-authn/extension](libs/extension)
This package conforms to the Firebase Extensions spec and is available from either NPM or the Extensions Hub.

[![Latest version in NPM](https://img.shields.io/npm/v/@firebase-web-authn/extension?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/extension)
### Installation
[![Install](https://img.shields.io/static/v1?label=&message=Install%20in%20Firebase%20console&logo=firebase&color=blue)](https://console.firebase.google.com/u/0/project/_/extensions/install?ref=gavinsawyer%2Ffirebase-web-authn)

To install from the Extensions Hub, click the button above or run the following commands in your project root:
```
% firebase ext:install gavinsawyer/firebase-web-authn
```
To install from NPM, run the following commands in your project root:
```
% npm i @firebase-web-authn/extension --save-dev
% firebase ext:install ./node_modules/@firebase-web-authn/extension
```
Using NPM is recommended to receive updates to the extension alongside other FirebaseWebAuthn dependencies.
### Additional setup:
1. As of July 2023, [supported roles for Firebase Extensions](https://firebase.google.com/docs/extensions/publishers/access#supported-roles) do not include `iam.serviceAccounts.signBlob` which is needed for custom auth providers.
   - After deploying the extension, grant the `Service Account Token Creator` role to the extension's service account in [IAM](https://console.cloud.google.com/iam-admin/iam) under `Firebase Extensions firebase-web-authn service account` > Edit > Assign roles.
   - If the service account isn't appearing, click `Grant Access` and enter its address as `ext-firebase-web-authn@${PROJECT_ID}.iam.gserviceaccount.com`
2. The browser must reach FirebaseWebAuthn from the same domain as your website. Modify your `firebase.json` to include a rewrite on each app where you'd like to use passkeys:

    ```json
    {
      "hosting": [
        {
          "target": "...",
          "rewrites": [
            {
              "source": "/firebase-web-authn-api",
              "function": "ext-firebase-web-authn-api"
            }
          ]
        }
      ]
    }
    ```
## [@firebase-web-authn/browser](libs/browser)
This package contains five tree-shakeable async methods for using FirebaseWebAuthn in components and a strongly-typed error object.

[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/browser?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/browser)
[![Firebase JS SDK version](https://img.shields.io/npm/dependency-version/@firebase-web-authn/browser/firebase?label=Firebase%20JS%20SDK&logo=firebase)](https://www.npmjs.com/package/firebase)
### Methods
```ts
createUserWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential>;
    signInWithPasskey: (auth: Auth, functions: Functions)               => Promise<UserCredential>;
      linkWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential>;
        unlinkPasskey: (auth: Auth, functions: Functions)               => Promise<void>;
verifyUserWithPasskey: (auth: Auth, functions: Functions)               => Promise<void>;
```
Designed to be used like the Firebase JavaScript SDK:
```ts
import { createUserWithEmailAndPassword } from "firebase/auth";
import { createUserWithPasskey }          from "@firebase-web-authn/browser";
```
```ts
class SignUpComponent {

  constructor(
    private readonly auth: Auth,
    private readonly functions: Functions,
  ) {
    // Firebase JavaScript SDK usage
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
Add `.catch((err: FirebaseWebAuthnError): void => console.error(err))` to these for a detailed error object with a `code`, `message`, `method`, and/or `operation`. `method` is present for Firebase errors, and `operation` is present on all errors except Firebase errors from Auth methods:
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
- If you are using biometrics to confirm an action happening server-side, use the `lastPresent` and `lastVerified` methods from [@firebase-web-authn/server](libs/server).
- The `webAuthnUsers` collection should not have read or write access from users. Your app should use a separate `users`/`profiles` document.
- The `name` parameter is not automatically stored anywhere except in the passkey. Changes made to this value in a passkey manager are not detectable by the app.
  - If FirebaseWebAuthn is configured as an MFA provider, pass the existing identifier.
  - If FirebaseWebAuthn is your only auth provider, you can pass any recognizable value. If you expect users to have multiple usernameless accounts, `name` can be a user-generated account name ("Personal"/"Work"/etc.). With generic `name` values consider passing something like "${FIRST_NAME} | Personal" for users who share a device with others.
- An anonymous user linked with a passkey is the same as a user created with `createUserWithPasskey`, and appears in Firebase as having no identifier and no provider. Users created this way are not deleted after 30 days with auto clean-up.
- When using `createUserWithPasskey`, you will find that no `onAuthStateChanged` callback fires when converting an anonymous account to a providerless account. Your callback should be passed to `onIdTokenChanged` instead.
## [@firebase-web-authn/server](libs/server)
This package contains four tree-shakeable async methods for using FirebaseWebAuthn in a secure context.

[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/server?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/server)
[![Firebase Admin SDK version](https://img.shields.io/npm/dependency-version/@firebase-web-authn/server/dev/firebase-admin?label=Firebase%20Admin%20SDK&logo=firebase)](https://www.npmjs.com/package/firebase-admin)
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
(await lastVerified(uid))?.seconds > (Date.now() / 1000) - 30 ?
  proceed() :
  askForReverification();
```
## Other packages
- [@firebase-web-authn/api](libs/api): This package contains a Firebase Function that registers and authenticates WebAuthn passkeys, manages public key credentials in Firestore, and cleans up data if the user cancels the process or unlinks a passkey.
- [@firebase-web-authn/types](libs/types): This package contains types and interfaces used internally by FirebaseWebAuthn and for implementing it in a secure context.
