## @firebase-web-authn/extension
A Firebase Extension for authentication with WebAuthn passkeys.

This package conforms to the Firebase Extensions spec and is available from either NPM or the Extensions Hub.

[![GitHub workflow status](https://img.shields.io/github/actions/workflow/status/gavinsawyer/firebase-web-authn/ci.yml)](https://github.com/gavinsawyer/firebase-web-authn/actions/workflows/ci.yml)
[![Latest version in NPM](https://img.shields.io/npm/v/@firebase-web-authn/extension?logo=npm)](https://www.npmjs.com/package/@firebase-web-authn/extension)
[![Install](https://img.shields.io/static/v1?label=&message=Install%20in%20Firebase%20console&logo=firebase&color=blue)](https://console.firebase.google.com/u/0/project/_/extensions/install?ref=gavinsawyer%2Ffirebase-web-authn)
#### Demo: https://firebase-web-authn.dev
### Installation
To install from NPM, run the following commands in your project root:
```
% npm i @firebase-web-authn/extension --save-dev
% firebase ext:install ./node_modules/@firebase-web-authn/extension
```
To install from the Extensions Hub, [use the Firebase console](https://console.firebase.google.com/u/0/project/_/extensions/install?ref=gavinsawyer%2Ffirebase-web-authn) or run the following commands in your project root:
```
% firebase ext:install gavinsawyer/firebase-web-authn
```
Using NPM is recommended to receive updates to the extension alongside other FirebaseWebAuthn dependencies.
### Additional setup:
1. As of July 2023, [supported roles for Firebase Extensions](https://firebase.google.com/docs/extensions/publishers/access#supported-roles) do not include `iam.serviceAccounts.signBlob` which is needed for custom auth providers.
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
