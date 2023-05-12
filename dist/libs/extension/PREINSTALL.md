Use this extension and the associated [browser library](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/browser) to create and sign in users with passkeys, link and unlink existing users to passkeys, and prompt signed-in users with a biometric verification request.

### Additional Setup

The browser must reach FirebaseWebAuthn from the same domain as your website. Modify your `firebase.json` to include a rewrite on each app where you'd like to use passkeys:

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

### Pre-Requisites

Before installing this extension, you'll need to set up these services in your Firebase project:
- App Check
- Authentication with the anonymous provider
- Firestore Database
- Functions

### Billing

To install an extension, your project must be on the Blaze (pay as you go) plan. This extension uses other Firebase and Google Cloud Platform services, which have associated charges if you exceed the service’s no-cost tier:
- Firestore Database
- Functions (Node.js 18 runtime)
