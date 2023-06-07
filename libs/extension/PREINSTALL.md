Use this extension and the associated [browser library](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/browser) to create and sign in users with passkeys, link and unlink existing users to passkeys, and prompt signed-in users with a biometric verification request.

### Additional Setup

1. As of May 2023, [supported roles for Firebase Extensions](https://firebase.google.com/docs/extensions/publishers/access#supported-roles) do not include `iam.serviceAccounts.signBlob` which is needed for custom auth providers.
   - After deploying the extension, grant the `Service Account Token Creator` role to the extension's service account in [IAM](https://console.cloud.google.com/iam-admin/iam) under `Firebase Extensions firebase-web-authn service account` > Edit > Assign roles.
   - If the service account isn't appearing, click `Grant Access` and enter its address as `ext-firebase-web-authn@${PROJECT_ID}.iam.gserviceaccount.com`
2. The browser must reach FirebaseWebAuthn from the same domain as your website. Modify your `firebase.json` to include a rewrite on each app where you'd like to use passkeys:

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
