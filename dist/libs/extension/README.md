## @firebase-web-authn/extension
A Firebase Extension for authentication with WebAuthn passkeys.

This package conforms to the Firebase Extensions spec and is available from either NPM or the Extensions Hub.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
[![Latest version in NPM](https://img.shields.io/npm/v/@firebase-web-authn/extension?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/extension)
#### Demo: https://firebase-web-authn.dev
### Installation
[![Install](https://img.shields.io/static/v1?label=&message=Install%20in%20Firebase%20console&logo=firebase&color=blue)](https://console.firebase.google.com/u/0/project/_/extensions/install?ref=gavinsawyer%2Ffirebase-web-authn)

To install from the Extensions Hub, click the button above or run the following commands in your project root:
```
% firebase ext:install gavinsawyer/firebase-web-authn
```
To install from NPM, run the following commands in your project root:
```
% npm i @firebase-web-authn/extension --save-dev
% firebase ext:install ./node_modules/@firebase-web-authn/extension
```
Using NPM is recommended to receive updates to the extension alongside other FirebaseWebAuthn dependencies.
### Prerequisites
Before installing this extension, you'll need to set up these services in your project. This must be done both in the Firebase Console and initialized in the application:
- App Check with reCAPTCHA Enterprise or v3
- Authentication with the anonymous provider
- Firestore
- Functions
### Additional setup:
1. Create a Firestore Database to store public key credentials with the ID `ext-firebase-web-authn` and location matching the function deployment. It is recommended to choose either `nam5` in North America or `eur3` in Europe and to enable delete protection:

    ```
    % firebase firestore:databases:create ext-firebase-web-authn --location ${MULTI_REGION_NAME} --delete-protection ENABLED
    ```

2. As of September 2023, [supported roles for Firebase Extensions](https://firebase.google.com/docs/extensions/publishers/access#supported-roles) do not include `iam.serviceAccounts.signBlob` which is needed for custom auth providers.
   - After deploying the extension, grant the `Service Account Token Creator` role to the extension's service account in [IAM](https://console.cloud.google.com/iam-admin/iam) under `Firebase Extensions firebase-web-authn service account` > Edit > Assign roles.
   - If the service account isn't appearing, click `Grant Access` and enter its address as `ext-firebase-web-authn@${PROJECT_ID}.iam.gserviceaccount.com`
3. The browser must reach FirebaseWebAuthn from the same domain as your website. Modify your `firebase.json` to include a rewrite on each app where you'd like to use passkeys:

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

## More packages
- [@firebase-web-authn/browser](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/browser)
- [@firebase-web-authn/server](https://github.com/gavinsawyer/firebase-web-authn/tree/main/libs/server)
