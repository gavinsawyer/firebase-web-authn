## @firebase-web-authn/extension
A Firebase Extension for authentication with WebAuthn passkeys.

This package conforms to the Firebase Extensions spec and is pending approval for the Extensions Hub.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
[![FirebaseWebAuthn version](https://img.shields.io/npm/v/@firebase-web-authn/extension?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/extension)
#### Demo: https://firebase-web-authn.dev
### Installation
Run the following commands from your project root:
```
% firebase ext:install gavinsawyer/firebase-web-authn
% firebase deploy --only extensions
```
> Firebase Extensions are in Beta. Deployment may fail to complete on the first attempt or fail altogether to set service account roles.
>
> If you are getting `PERMISSION_DENIED` errors from the API, grant the `Cloud Datastore User` and `Service Account Token Creator` roles to the `Firebase Extensions firebase-web-authn service account` principal in [IAM](https://console.cloud.google.com/iam-admin/iam) under `Firebase Extensions firebase-web-authn service account` > Edit > Assign roles.
> 
> If you don't see the service account, click `Grant Access` and enter its address as `ext-firebase-web-authn@${PROJECT_ID}.iam.gserviceaccount.com`
---
## Authenticate with WebAuthn

**Author**: Gavin Sawyer (**[https://gavinsawyer.dev](https://gavinsawyer.dev)**)

**Description**: Adds support for WebAuthn as a primary or multi-factor auth provider.

**Details**: Use this extension and the associated [browser library](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/browser) to create and sign in users with passkeys, link and unlink existing users to passkeys, and prompt signed-in users with a biometric verification request.

### Additional setup

The browser must reach FirebaseWebAuthn from the same domain as your website. Modify your `firebase.json` to include a rewrite on each app where you'd like to use passkeys:

```json
{
  "hosting": [
    {
      "target": "...",
      "rewrites": [
        {
          "source": "/firebase-web-authn",
          "function": "ext-firebase-web-authn-api"
        }
      ]
    }
  ]
}
```

### Configuration parameters

- Cloud Functions location: Where do you want to deploy the functions created for this extension? You usually want a location close to your database. For help selecting a location, refer to the [location selection guide](https://firebase.google.com/docs/functions/locations).
- Authenticator attachment: What [authenticator attachment](https://www.w3.org/TR/webauthn-2/#enum-attachment) modality would you like to use with WebAuthn? "cross-platform" allows security keys. "platform" allows passkey managers.
- Relying party name: What relying party name would you like to use with WebAuthn? This appears in the passkey window in some browsers in place of your domain name.
- User verification requirement: What [user verification requirement](https://www.w3.org/TR/webauthn/#enumdef-userverificationrequirement) would you like to use with WebAuthn? See [User Presence vs. User Verification](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html).

### Billing

To install an extension, your project must be on the Blaze (pay as you go) plan. This extension uses other Firebase and Google Cloud Platform services, which have associated charges if you exceed the service’s no-cost tier:
- Firestore Database
- Functions (Node.js 18 runtime)
