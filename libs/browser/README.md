## @firebase-web-authn/browser
A Firebase Extension for authentication with WebAuthn passkeys.

This package contains five tree-shakeable async methods for using FirebaseWebAuthn in components and a strongly-typed error object.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/browser?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/browser)
[![Firebase JS SDK version](https://img.shields.io/npm/dependency-version/@firebase-web-authn/browser/firebase?label=Firebase%20JS%20SDK&logo=firebase)](https://www.npmjs.com/package/firebase)
#### Demo: https://firebase-web-authn.dev
### Methods
```ts
createUserWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential>;
    signInWithPasskey: (auth: Auth, functions: Functions)               => Promise<UserCredential>;
      linkWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential>;
        unlinkPasskey: (auth: Auth, functions: Functions)               => Promise<void>;
verifyUserWithPasskey: (auth: Auth, functions: Functions)               => Promise<void>;
```
#### 🎉 2FA passkeys are here in ^10.3.0!
All methods besides `createUserWithPasskey` accept an optional `factor` parameter of `"first"` or `"second"`.

Default behaviors were designed to maintain backwards compatibility and are described below:
```ts
          signInWithPasskey(auth, functions) // Sign in and accept either credential.
 signInWithPasskey(auth, functions, "first") // Sign in and only accept a first (1FA) factor credential.
signInWithPasskey(auth, functions, "second") // Sign in and only accept a second (2FA) factor credential.
```
```ts
          linkWithPasskey(auth, functions, username) // Link a first (1FA) factor credential.
 linkWithPasskey(auth, functions, username, "first") // Link a first (1FA) factor credential.
linkWithPasskey(auth, functions, username, "second") // Link a second (2FA) factor credential.
```
```ts
          unlinkWithPasskey(auth, functions) // Unlink all credentials.
 unlinkWithPasskey(auth, functions, "first") // Unlink all credentials.
unlinkWithPasskey(auth, functions, "second") // Unlink a second (2FA) factor credential.
```
```ts
          verifyUserWithPasskey(auth, functions) // Verify the user and allow either credential.
 verifyUserWithPasskey(auth, functions, "first") // Verify the user and allow only a first (1FA) factor credential.
verifyUserWithPasskey(auth, functions, "second") // Verify the user and allow only a second (2FA) factor credential.
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
  operation?: "clear challenge" | "clear credential" | "create authentication challenge" | "create reauthentication challenge" | "create registration challenge" | "verify authentication" | "verify reauthentication" | "verify registration";
}
```
### Caveats
- The anonymous sign-in provider must be enabled in Firebase.
- `onAuthStateChanged` callbacks are only fired upon starting auth or registration if your user is not already signed in anonymously.
- `onIdTokenChanged` callbacks are fired upon successfully converting from an anonymous account to a WebAuthn account.
- If you are using biometrics to confirm an action that will happen server-side, use methods from [@firebase-web-authn/server](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/server).
- The `ext-firebase-web-authn` Firestore Database should not have rules permitting client-side access for security pattern reasons.
- The `name` parameter is only used by the passkey manager and changes to it are not detectable by the browser.
  - If FirebaseWebAuthn is configured as an MFA provider, pass the existing identifier. This way it is stored alongside the user's primary credential.
  - If FirebaseWebAuthn is your only auth provider, you can pass any recognizable value. If you expect users to have multiple usernameless accounts, `name` can be a user-generated account name ("Personal"/"Work"/etc.). With generic `name` values consider passing something like "${FIRST_NAME} | Personal" for users who share a device with others.
## More packages
- [@firebase-web-authn/extension](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/extension)
- [@firebase-web-authn/server](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/server)
