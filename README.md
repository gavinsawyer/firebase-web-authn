# FirebaseWebAuthn
#### `Firebase Authentication` `Firebase Functions` `Firestore` `SimpleWebAuthn`
An unofficial Firebase extension for authentication with WebAuthn passkeys.

See the demo online at https://firebase-web-authn.dev.
## [@firebase-web-authn/browser](libs/browser)
`% npm install @firebase-web-authn/browser --save`
### Methods
```ts
import { createUserWithPasskey, signInWithPasskey, verifyUserWithPasskey } from "@firebase-web-authn/browser";
```
```ts
createUserWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential>;
    signInWithPasskey: (auth: Auth, functions: Functions)               => Promise<UserCredential>;
verifyUserWithPasskey: (auth: Auth, functions: Functions)               => Promise<void>;
```
Passkeys can be used as an MFA provider, as well:
```ts
import { linkWithPasskey, unlinkPasskey } from "@firebase-web-authn/browser";
```
```ts
linkWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential>;
  unlinkPasskey: (auth: Auth, functions: Functions)               => Promise<void>;
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
- Your backend security logic should depend on the `lastPresent` and `lastVerified` fields in the user's document in the `webAuthnUsers` collection which is updated automatically on sign-in and verification. [User Presence vs User Verification](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html)
- The `name` parameter is not stored except in the passkey and can be changed by the user without the app being able to know. Once users are signed in, your app should create a document in a separate `users`/`profiles` collection to store user information.
- An anonymous user linked with a passkey is the same as a user created with `createUserWithPasskey`, and is marked by Firebase as having no provider.
- Because users don't change their `uid` between starting and completing creating an account, your app should listen to `onIdTokenChanged` rather than `onAuthStateChanged`.
## [@firebase-web-authn/functions](libs/functions)
### Deployment
This package contains a Firebase Function used to facilitate registering, authenticating, reauthenticating WebAuthn passkeys, and clearing data if the user cancels the process or unlinks a passkey.

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
