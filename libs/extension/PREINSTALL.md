Use this extension and the associated [browser library](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/browser) to create and sign in users with passkeys, link and unlink existing users to passkeys, and prompt signed-in users with a biometric verification request.
### Additional Setup
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
### Pre-Requisites
Before installing this extension, you'll need to set up these services in your Firebase project:
- Firebase Authentication and the Anonymous provider.
- Cloud Firestore
- Cloud Functions
### Billing
To install an extension, your project must be on the Blaze (pay as you go) plan
- This extension uses other Firebase and Google Cloud Platform services, which have associated charges if you exceed the service’s no-cost tier:
  - Cloud Firestore
  - Cloud Functions (Node.js 18 runtime)
