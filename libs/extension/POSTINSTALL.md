### Using the extension

The browser must reach FirebaseWebAuthn from the same domain as your website. Modify your `firebase.json` to include a rewrite on each app where you'd like to use passkeys.

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

Install the [browser package](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/browser):

```
% npm install --save @firebase-web-authn/browser
```

#### Methods

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

#### Caveats

- The `webAuthnUsers` collection should not have read or write access from users. Your app should use a separate `users`/`profiles` document.
- Your backend security logic should depend on the `lastPresent` and `lastVerified` fields in the user's document which is updated automatically on sign-in or verification.
  - `WebAuthnUserDocument` is exported from [@firebase-web-authn/types](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/types).
  - See [User Presence vs User Verification](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html).
- The `name` parameter is not automatically stored anywhere except in the passkey. Changes made to this value in a passkey manager are not detectable by the app.
  - If FirebaseWebAuthn is configured as an MFA provider, pass the existing identifier.
  - If FirebaseWebAuthn is your only auth provider, you can pass any recognizable value. If you expect users to have multiple usernameless accounts, `name` can be a user-generated account name ("Personal"/"Work"/etc.). With generic `name` values consider passing something like "${FIRST_NAME} | Personal" for users who share a device with others.
- An anonymous user linked with a passkey is the same as a user created with `createUserWithPasskey`, and appears in Firebase as having no identifier and no provider. Users created this way are not deleted after 30 days with auto clean-up.
- When using `createUserWithPasskey`, you will find that no `onAuthStateChanged` callback fires when converting an anonymous account to a providerless account. Your callback should be passed to `onIdTokenChanged` instead.