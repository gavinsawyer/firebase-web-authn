## @firebase-web-authn/functions
A Firebase Extension for authentication with WebAuthn passkeys.

This package contains a Firebase Function that registers and authenticates WebAuthn passkeys, manages public key credentials in Firestore, and cleans up data if the user cancels the process or unlinks a passkey.

[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/functions?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/functions)
[![Firebase SDK for Cloud Functions version](https://img.shields.io/npm/dependency-version/@firebase-web-authn/functions/firebase-functions?label=Firebase%20SDK%20for%20Cloud%20Functions&logo=firebase)](https://www.npmjs.com/package/firebase-functions)
### Firebase Extension deployment
See [@firebase-web-authn/extension](https://github.com/gavinsawyer/firebase-web-authn#firebase-web-authnextension) for simplified installation using `firebase ext:install`.
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
