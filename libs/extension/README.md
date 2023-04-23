## Authenticate with WebAuthn

**Author**: Gavin Sawyer (**[https://gavinsawyer.dev](https://gavinsawyer.dev)**)

**Description**: Adds support for WebAuthn as a primary or multi-factor auth provider.

**Details**: Use this extension to create and sign in users with passkeys, link and unlink existing users to passkeys, and prompt signed-in users with a biometric verification request.

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
- Collection path: What is the path of the collection that you would like to use for WebAuthn users?
- Authenticator attachment: What authenticator attachment modality would you like to use with WebAuthn? "cross-platform" allows security keys. "platform" allows passkey managers in the user's cloud or browser.
- Relying party name: What relying party name would you like to use with WebAuthn? This appears in the passkey window in some browsers in place of your domain name.
- User verification requirement: What user verification requirement would you like to use with WebAuthn? See [User Presence vs. User Verification](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html).
### Billing
To install an extension, your project must be on the Blaze (pay as you go) plan
- This extension uses other Firebase and Google Cloud Platform services, which have associated charges if you exceed the service’s no-cost tier:
  - Cloud Firestore
  - Cloud Functions (Node.js 18 runtime)
