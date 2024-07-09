### 🎉 2FA passkeys are here in ^10.3.0!
#### This update brings support for linking secondary discoverable credentials using an alternate attachment (which defaults to `"cross-platform"`).
#### By specifying a `factor` parameter to existing [browser library](https://github.com/gavinsawyer/firebase-web-authn#firebase-web-authnbrowser) methods, you can enable users to gain access by inserting and activating or waving a security key over the device.
#### See the [full docs](https://github.com/gavinsawyer/firebase-web-authn) for examples and a feature complete demo.

Use this extension and the [browser library](https://github.com/gavinsawyer/firebase-web-authn#firebase-web-authnbrowser) to create and sign in users with passkeys, link and unlink existing users to passkeys, and prompt signed-in users with a biometric verification request:

#### Methods

```ts
createUserWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential>;
    signInWithPasskey: (auth: Auth, functions: Functions)     => Promise<UserCredential>;
      linkWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential>;
        unlinkPasskey: (auth: Auth, functions: Functions)               => Promise<void>;
verifyUserWithPasskey: (auth: Auth, functions: Functions)               => Promise<void>;
```

Designed to be used like the Firebase JavaScript SDK:

```ts
import { createUserWithEmailAndPassword } from "firebase/auth";
import { createUserWithPasskey }          from "@firebase-web-authn/browser";
```

```ts
class SignUpComponent {

  constructor(
    private readonly auth: Auth,
    private readonly functions: Functions,
  ) {
    // Firebase JavaScript SDK usage
    this
      .createUserWithEmailAndPassword = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password)
      .then(() => void(0));

    // FirebaseWebAuthn usage
    this
      .createUserWithPasskey = (name: string) => createUserWithPasskey(auth, functions, name)
      .then(() => void(0));

  }

  public readonly createUserWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  public readonly createUserWithPasskey: (name: string) => Promise<void>;

}
```

Use the [server library](https://github.com/gavinsawyer/firebase-web-authn#firebase-web-authnserver) to confirm important actions happening server-side:

#### Methods

```ts
  backupEligible: (uid: string, app?: App) => Promise<boolean | null>;
backupSuccessful: (uid: string, app?: App) => Promise<boolean | null>;
     credentials: (uid: string, app?: App) => Promise<{ [key in "primary" | "backup"]: WebAuthnUserCredential | null }>;
     lastPresent: (uid: string, app?: App) => Promise<Timestamp | null>;
    lastVerified: (uid: string, app?: App) => Promise<Timestamp | null>;
```

Designed to be used within Firebase Functions or another secure context with access to Firestore to check users' status with FirebaseWebAuthn:

```ts
import { getApps, initializeApp } from "firebase-admin/app";
import { lastVerified }           from "@firebase-web-authn/server";
```

```ts
getApps().length === 0 && initializeApp();

// If the user was verified within the past 30 seconds, proceed. Otherwise, ask for reverification:
(await lastVerified(user.uid))?.seconds > (Date.now() / 1000) - 30 ?
  proceed() :
  askForReverification();
```

### Prerequisites

Before installing this extension, you'll need to set up these services in your project. This must be done both in the Firebase Console and initialized in the application:
- App Check with reCAPTCHA Enterprise or v3
- Authentication with the anonymous provider
- Firestore
- Functions

### Additional Setup

1. Create a Firestore Database to store public key credentials with the ID `ext-firebase-web-authn` and location matching the function deployment. It is recommended to choose either `nam5` in North America or `eur3` in Europe and to enable delete protection:

    ```
    % firebase firestore:databases:create ext-firebase-web-authn --location ${MULTI_REGION_NAME} --delete-protection ENABLED
    ```

2. As of July 2024, [supported roles for Firebase Extensions](https://firebase.google.com/docs/extensions/publishers/access#supported-roles) do not include `iam.serviceAccounts.signBlob` or `serviceusage.services.use` which are needed for custom auth providers.
   - After deploying the extension, grant the `Service Account Token Creator` and `Service Usage Consumer` roles to the extension's service account in [IAM](https://console.cloud.google.com/iam-admin/iam) under `Firebase Extensions firebase-web-authn service account` > Edit > Assign roles.
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

### Billing

To install an extension, your project must be on the Blaze (pay as you go) plan. This extension uses other Firebase and Google Cloud Platform services, which have associated charges if you exceed the service’s no-cost tier:
- Firestore Database
- Functions (Node.js 18 runtime)
