## @firebase-web-authn/api
A Firebase Extension for authentication with WebAuthn passkeys.

This package contains a Firebase Function that registers and authenticates WebAuthn passkeys, manages public key credentials in Firestore, and cleans up data if the user cancels the process or unlinks a passkey.

[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/api?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/api)
[![Firebase SDK for Cloud Functions version](https://img.shields.io/npm/dependency-version/@firebase-web-authn/api/firebase-functions?label=Firebase%20SDK%20for%20Cloud%20Functions&logo=firebase)](https://www.npmjs.com/package/firebase-functions)
### Firebase Extension deployment
See [@firebase-web-authn/extension](https://github.com/gavinsawyer/firebase-web-authn#firebase-web-authnextension) for simplified installation using `firebase ext:install`.
### Custom deployment
If you would rather deploy the API from your existing Firebase Functions package,
1. Set up these services in your project. This must be done both in the Firebase Console and initialized in the application:
   - App Check with reCAPTCHA Enterprise or v3
   - Authentication with the anonymous provider
   - Firestore
   - Functions
2. Run:

   ```
   % npm install @firebase-web-authn/api --save-dev
   ```

3. Export the API from your Firebase Functions package's `main` file by calling `getFirebaseWebAuthnApi` with a config object.
   ```ts
   import { initializeApp }                     from "firebase-admin/app";
   import { HttpsFunction }                     from "firebase-functions";
   import { getFirebaseWebAuthnApi }            from "@firebase-web-authn/api";
   import { FunctionRequest, FunctionResponse } from "firebase-web-authn/types";


   getApps().length === 0 && initializeApp();

   export const firebaseWebAuthnAPI: CallableFunction<FunctionRequest, FunctionResponse> = getFirebaseWebAuthnApi({...});

   // Other api...
   ```
   ```ts
   interface FirebaseWebAuthnConfig {
     authenticatorAttachment?: AuthenticatorAttachment,         // Preferred authenticator attachment modality. "cross-platform" allows security keys. "platform" allows passkey managers. Not specifying a value allows either attachment
     relyingPartyName: string,                                  // Your app's display name in the passkey popup on some browsers.
     userVerificationRequirement?: UserVerificationRequirement, // Your app's user verification requirement. "preferred" is default.
   }
   ```
4. Deploy your Firebase Functions:

   ```
   % firebase deploy --only functions
   ```
### Additional setup
1. Create a Firestore Database to store public key credentials with the ID `ext-firebase-web-authn` and location matching the function deployment. It is recommended to choose either `nam5` in North America or `eur3` in Europe and to enable delete protection:

    ```
    % firebase firestore:databases:create ext-firebase-web-authn --location ${MULTI_REGION_NAME} --delete-protection ENABLED
    ```

2. The browser must reach FirebaseWebAuthn from the same domain as your website. Modify your `firebase.json` to include a rewrite on each app where you'd like to use passkeys:

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
3. Grant the `Cloud Datastore User` and `Service Account Token Creator` roles to the `App Engine default service account` principal in [Service accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) under `App Engine default service account` > Permissions.
4. Grant the `Cloud Functions Invoker` role to the `allUsers` principal in [Cloud Functions](https://console.cloud.google.com/functions/list) under `firebaseWebAuthnAPI` > Permissions.
## More packages
- [@firebase-web-authn/extension](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/extension)
- [@firebase-web-authn/browser](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/browser)
- [@firebase-web-authn/server](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/server)
