# FirebaseWebAuthn
A Firebase Extension for authentication with WebAuthn passkeys.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
#### Demo: https://firebase-web-authn.dev
### Thesis
WebAuthn enables creating an account or signing in with as few as two clicks and doesn't ask the user to remember anything. This extension addresses a [popular feature request](https://github.com/firebase/firebase-js-sdk/issues/2123) for WebAuthn support in Firebase sites. Features include creating and signing in users with passkeys, linking and unlinking existing users to passkeys, and prompting signed-in users with a biometric verification request. Your site will also securely be able to tell when a user was verified last with biometrics.
## [@firebase-web-authn/extension](libs/extension)
This package conforms to the Firebase Extensions spec and is pending approval for the Extensions Hub.

[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/extension?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/extension)
### Installation
To install using NPM, run the following commands from your project root:
```
% npm i @firebase-web-authn/extension --save-dev
% firebase ext:install ./node_modules/@firebase-web-authn/extension
```
To install using the Extensions Hub, run:
```
% firebase ext:install gavinsawyer/firebase-web-authn@9.4.19-rc.0
```
Using NPM is recommended to receive updates to FirebaseWebAuthn alongside your other dependencies.
> #### Caveat
>
> As of May 2023, [supported roles for Firebase Extensions](https://firebase.google.com/docs/extensions/publishers/access#supported-roles) do not include `iam.serviceAccounts.signBlob` which is needed for custom auth providers.
>
> After deploying the extension, make sure the `Service Account Token Creator` and `Cloud Datastore User` roles are granted to the `Firebase Extensions firebase-web-authn service account` principal in [IAM](https://console.cloud.google.com/iam-admin/iam) under `Firebase Extensions firebase-web-authn service account` > Edit > Assign roles.
>
> If you don't see the service account, click `Grant Access` and enter its address as `ext-firebase-web-authn@${PROJECT_ID}.iam.gserviceaccount.com`
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
- The `webAuthnUsers` collection should not have read or write access from users. Your app should use a separate `users`/`profiles` document.
- Your backend security logic should depend on the `lastPresent` and `lastVerified` fields in the user's document which is updated automatically on successful operations.
  - `WebAuthnUserDocument` is exported from [@firebase-web-authn/types](libs/types).
  - See [User Presence vs User Verification](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html).
- The `name` parameter is not automatically stored anywhere except in the passkey. Changes made to this value in a passkey manager are not detectable by the app.
  - If FirebaseWebAuthn is configured as an MFA provider, pass the existing identifier.
  - If FirebaseWebAuthn is your only auth provider, you can pass any recognizable value. If you expect users to have multiple usernameless accounts, `name` can be a user-generated account name ("Personal"/"Work"/etc.). With generic `name` values consider passing something like "${FIRST_NAME} | Personal" for users who share a device with others.
- An anonymous user linked with a passkey is the same as a user created with `createUserWithPasskey`, and appears in Firebase as having no identifier and no provider. Users created this way are not deleted after 30 days with auto clean-up.
- When using `createUserWithPasskey`, you will find that no `onAuthStateChanged` callback fires when converting an anonymous account to a providerless account. Your callback should be passed to `onIdTokenChanged` instead.
## [@firebase-web-authn/functions](libs/functions)
This package contains a Firebase Function that registers and authenticates WebAuthn passkeys, manages public key credentials in Firestore, and cleans up data if the user cancels the process or unlinks a passkey.

[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/functions?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/functions)
[![Firebase-Functions version](https://img.shields.io/npm/dependency-version/@firebase-web-authn/functions/firebase-functions?logo=firebase)](https://www.npmjs.com/package/firebase-functions)
### Firebase Extension deployment
See [@firebase-web-authn/extension](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/extension) for installation instructions using `firebase ext:install`.
### Custom deployment
If you would rather deploy FirebaseWebAuthn from your existing Firebase Functions package,
1. Run:

`% npm install @firebase-web-authn/functions --save-dev`

2. Export the API from your Firebase Functions package's `main` file by calling `getFirebaseWebAuthnApi` with a config object.
```ts
import { initializeApp }          from "firebase-admin/app";
import { HttpsFunction }          from "firebase-functions";
import { getFirebaseWebAuthnApi } from "@firebase-web-authn/functions";


getApps().length === 0 && initializeApp();

export const firebaseWebAuthnAPI: HttpsFunction = getFirebaseWebAuthnApi({...});

// Other functions...
```
```ts
interface FirebaseWebAuthnConfig {
  authenticatorAttachment: AuthenticatorAttachment,          // Preferred authenticator attachment modality. "cross-platform" allows security keys. "platform" allows passkey managers.
  relyingPartyName: string,                                  // Your app's display name in the passkey popup on some browsers.
  userVerificationRequirement?: UserVerificationRequirement, // Your app's user verification requirement. "preferred" is default.
}
```
3. Deploy your Firebase Functions:

`% firebase deploy --only functions`
### Additional setup
1. The browser must reach FirebaseWebAuthn from the same domain as your website. Modify your `firebase.json` to include a rewrite on each app where you'd like to use passkeys:
```json
{
  "hosting": [
    {
      "target": "...",
      "rewrites": [
        {
          "source": "/firebase-web-authn-api",
          "function": "firebaseWebAuthnAPI"
        }
      ]
    }
  ]
}
```
2. Set up these services in your Firebase project:
- App Check
- Authentication with the anonymous provider
- Firestore Database
- Functions
3. Grant the `Cloud Datastore User` and `Service Account Token Creator` roles to the `App Engine default service account` principal in [Service accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) under `App Engine default service account` > Permissions.
4. Grant the `Cloud Functions Invoker` role to the `allUsers` principal in [Cloud Functions](https://console.cloud.google.com/functions/list) under `firebaseWebAuthnAPI` > Permissions.
## [@firebase-web-authn/types](libs/types)
This package contains types and interfaces used internally by FirebaseWebAuthn and for implementing it in a secure context.

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
