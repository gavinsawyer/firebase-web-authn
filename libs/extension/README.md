## @firebase-web-authn/extension
A Firebase extension for authentication with WebAuthn passkeys.

This package conforms to the Firebase Extensions spec and is pending approval for the Extensions Marketplace Early Access Program.

If you know a way to install it from the source code, you will be able to bypass most of the setup process.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/extension?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/extension)
#### Demo: https://firebase-web-authn.dev

---
## Authenticate with WebAuthn

**Author**: Gavin Sawyer (**[https://gavinsawyer.dev](https://gavinsawyer.dev)**)

**Description**: Adds support for WebAuthn as a primary or multi-factor auth provider.

**Details**: Use this extension and the associated [browser library](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/browser) to create and sign in users with passkeys, link and unlink existing users to passkeys, and prompt signed-in users with a biometric verification request.

### Additional setup
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
### Configuration Parameters
- Cloud Functions location: Where do you want to deploy the functions created for this extension? You usually want a location close to your database. For help selecting a location, refer to the [location selection guide](https://firebase.google.com/docs/functions/locations).
- Authenticator attachment: What [authenticator attachment](https://www.w3.org/TR/webauthn-2/#enum-attachment) modality would you like to use with WebAuthn? "cross-platform" allows security keys. "platform" allows passkey managers.
- Relying party name: What relying party name would you like to use with WebAuthn? This appears in the passkey window in some browsers in place of your domain name.
- User verification requirement: What [user verification requirement](https://www.w3.org/TR/webauthn/#enumdef-userverificationrequirement) would you like to use with WebAuthn? See [User Presence vs. User Verification](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html).
### Billing
To install an extension, your project must be on the Blaze (pay as you go) plan
- This extension uses other Firebase and Google Cloud Platform services, which have associated charges if you exceed the service’s no-cost tier:
  - Cloud Firestore
  - Cloud Functions (Node.js 18 runtime)
