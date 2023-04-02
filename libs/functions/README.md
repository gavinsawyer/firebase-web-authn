## @firebase-web-authn/functions
An unofficial Firebase extension for authentication with WebAuthn passkeys.

See the demo online at https://firebase-web-authn.dev.
### Deployment
This package contains a Firebase Function used to facilitate registering, authenticating, reauthenticating WebAuthn passkeys, and clearing data if the user cancels the process or unlinks a passkey.

From your Firebase Functions package root, run:

`% npm install @firebase-web-authn/functions --save`

Re-export the function from your `functions/index.ts` file.
```ts
import { initializeApp } from 'firebase-admin/app';


initializeApp();

export { firebaseWebAuthn } from '@firebase-web-authn/functions';

// Other functions...
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
- Enable the Anonymous authentication provider in Firebase if you are not using it already.
- Add the `Service Account Token Creator` role to your Firebase Functions' service account in [GCP IAM project permissions](https://console.cloud.google.com/iam-admin/iam). This is either the `Default compute service account` or the `App Engine default service account`, and can be seen under "Runtime service account" in [GCP Cloud Function configuration](https://console.cloud.google.com/functions/list) after deployment.
