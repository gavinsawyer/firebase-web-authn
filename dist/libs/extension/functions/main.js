// libs/extension/functions/main.ts
import { getApps, initializeApp } from "firebase-admin/app";

// libs/api/src/lib/getFirebaseWebAuthnApi.ts
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

// libs/api/src/lib/function responses/lib/clearChallenge.ts
import { FieldValue } from "firebase-admin/firestore";
var clearChallenge = (options) => options.webAuthnUserDocumentReference.get().then(
  (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.challenge ? (userDocument.lastPresent ? options.webAuthnUserDocumentReference.update(
    {
      challenge: FieldValue.delete()
    }
  ) : options.webAuthnUserDocumentReference.delete()).then(
    () => ({
      operation: "clear challenge",
      success: true
    }),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: "clear challenge",
      success: false
    })
  ) : {
    code: "no-op",
    message: "No operation is needed.",
    operation: "clear challenge",
    success: false
  } : {
    code: "missing-user-doc",
    message: "No user document was found in Firestore.",
    operation: "clear challenge",
    success: false
  })(userDocumentSnapshot.data()),
  (firebaseError) => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: "clear challenge",
    success: false
  })
);

// libs/api/src/lib/function responses/lib/clearUserDoc.ts
var clearUserDoc = (options) => options.webAuthnUserDocumentReference.get().then(
  (userDocumentSnapshot) => (async (userDocument) => userDocument ? options.webAuthnUserDocumentReference.delete().then(
    () => ({
      operation: "clear user doc",
      success: true
    }),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: "clear user doc",
      success: false
    })
  ) : {
    code: "no-op",
    message: "No operation is needed.",
    operation: "clear user doc",
    success: false
  })(userDocumentSnapshot.data()),
  (firebaseError) => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: "clear user doc",
    success: false
  })
);

// libs/api/src/lib/function responses/lib/createAuthenticationChallenge.ts
import { generateAuthenticationOptions } from "@simplewebauthn/server";
var createAuthenticationChallenge = (options) => generateAuthenticationOptions(
  {
    rpID: options.hostname,
    userVerification: options.userVerificationRequirement
  }
).then(
  (publicKeyCredentialRequestOptionsJSON) => options.webAuthnUserDocumentReference.set(
    {
      challenge: {
        process: "authentication",
        processingCredentialType: options.authenticatingCredentialType,
        value: publicKeyCredentialRequestOptionsJSON.challenge
      }
    },
    {
      merge: true
    }
  ).then(
    () => ({
      authenticatingCredentialType: options.authenticatingCredentialType,
      operation: "create authentication challenge",
      requestOptions: publicKeyCredentialRequestOptionsJSON,
      success: true
    }),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: "create authentication challenge",
      success: false
    })
  )
);

// libs/api/src/lib/function responses/lib/createReauthenticationChallenge.ts
import { generateAuthenticationOptions as generateAuthenticationOptions2 } from "@simplewebauthn/server";
var createReauthenticationChallenge = (options) => options.webAuthnUserDocumentReference.get().then(
  (userDocumentSnapshot) => (async (userDocument) => userDocument ? (options.reauthenticatingCredentialType === "backup" ? userDocument.backupCredential : userDocument.credential) ? generateAuthenticationOptions2(
    {
      allowCredentials: options.reauthenticatingCredentialType === "backup" ? [
        {
          id: userDocument.backupCredential?.id || new Uint8Array(),
          type: "public-key"
        }
      ] : [
        {
          id: userDocument.credential?.id || new Uint8Array(),
          type: "public-key"
        }
      ],
      rpID: options.hostname,
      userVerification: options.userVerificationRequirement
    }
  ).then(
    (publicKeyCredentialRequestOptions) => options.webAuthnUserDocumentReference.set(
      {
        challenge: {
          process: "reauthentication",
          processingCredentialType: options.reauthenticatingCredentialType,
          value: publicKeyCredentialRequestOptions.challenge
        }
      },
      {
        merge: true
      }
    ).then(
      () => ({
        operation: "create reauthentication challenge",
        reauthenticatingCredentialType: options.reauthenticatingCredentialType,
        requestOptions: publicKeyCredentialRequestOptions,
        success: true
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: "create reauthentication challenge",
        success: false
      })
    )
  ) : {
    code: "user-doc-missing-passkey-fields",
    message: "User doc is missing passkey fields from prior operation.",
    operation: "create reauthentication challenge",
    success: false
  } : {
    code: "missing-user-doc",
    message: "No user document was found in Firestore.",
    operation: "create reauthentication challenge",
    success: false
  })(userDocumentSnapshot.data()),
  (firebaseError) => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: "create reauthentication challenge",
    success: false
  })
);

// libs/api/src/lib/function responses/lib/createRegistrationChallenge.ts
import { generateRegistrationOptions } from "@simplewebauthn/server";
var createRegistrationChallenge = (options) => options.webAuthnUserDocumentReference.get().then(
  (userDocumentSnapshot) => (async (userDocument) => (options.registeringCredentialType === "backup" ? !userDocument?.backupCredential : !userDocument?.credential) ? (options.registeringCredentialType === "backup" ? userDocument && userDocument.credential : !userDocument?.credential) ? generateRegistrationOptions(
    {
      authenticatorSelection: {
        authenticatorAttachment: options.authenticatorAttachment,
        residentKey: "required",
        userVerification: options.userVerificationRequirement
      },
      rpID: options.hostname,
      rpName: options.relyingPartyName,
      userID: options.userID,
      userName: options.userName
    }
  ).then(
    (publicKeyCredentialCreationOptions) => options.webAuthnUserDocumentReference.set(
      {
        challenge: {
          process: "registration",
          processingCredentialType: options.registeringCredentialType,
          value: publicKeyCredentialCreationOptions.challenge
        }
      },
      {
        merge: true
      }
    ).then(
      () => ({
        creationOptions: publicKeyCredentialCreationOptions,
        operation: "create registration challenge",
        registeringCredentialType: options.registeringCredentialType,
        success: true
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: "create registration challenge",
        success: false
      })
    )
  ) : {
    code: "missing-primary",
    message: "No primary passkey was found in Firestore.",
    operation: "create registration challenge",
    success: false
  } : {
    code: "no-op",
    message: "No operation is needed.",
    operation: "create registration challenge",
    success: false
  })(userDocumentSnapshot.data()),
  (firebaseError) => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: "create registration challenge",
    success: false
  })
);

// libs/api/src/lib/function responses/lib/verifyAuthentication.ts
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { FieldValue as FieldValue2, Timestamp } from "firebase-admin/firestore";
var verifyAuthentication = (options) => options.authenticationResponse.response.userHandle !== options.userID ? options.webAuthnUserCollectionReference.doc(options.authenticationResponse.response.userHandle || "").get().then(
  (targetUserDocumentSnapshot) => (async (targetUserDocument) => targetUserDocument ? options.webAuthnUserDocumentReference.get().then(
    (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.challenge && userDocument.challenge.process === "authentication" ? targetUserDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"] ? verifyAuthenticationResponse(
      {
        authenticator: {
          counter: targetUserDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.counter || 0,
          credentialID: targetUserDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.id || new Uint8Array(0),
          credentialPublicKey: targetUserDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.publicKey || new Uint8Array(0)
        },
        expectedChallenge: userDocument.challenge.value,
        expectedOrigin: "https://" + options.hostname,
        expectedRPID: options.hostname,
        requireUserVerification: options.userVerificationRequirement === "required" || options.userVerificationRequirement === "preferred",
        response: options.authenticationResponse
      }
    ).then(
      (primaryVerifiedAuthenticationResponse) => primaryVerifiedAuthenticationResponse.verified ? options.webAuthnUserCollectionReference.doc(options.authenticationResponse.response.userHandle || "").update(
        {
          [userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]: {
            ...targetUserDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"],
            backupEligible: primaryVerifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice",
            backupSuccessful: primaryVerifiedAuthenticationResponse.authenticationInfo.credentialBackedUp
          },
          lastCredentialUsed: userDocument.challenge?.processingCredentialType,
          lastPresent: Timestamp.fromDate(/* @__PURE__ */ new Date()),
          lastVerified: primaryVerifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(/* @__PURE__ */ new Date()) : targetUserDocument["lastVerified"] || FieldValue2.delete()
        }
      ).then(
        () => (userDocument.lastPresent ? options.webAuthnUserDocumentReference.update(
          {
            challenge: FieldValue2.delete()
          }
        ) : options.webAuthnUserDocumentReference.delete()).then(
          () => options.createCustomToken(options.authenticationResponse.response.userHandle || "").then(
            (customToken) => ({
              authenticatedCredentialType: "primary",
              customToken,
              operation: "verify authentication",
              success: true
            }),
            (firebaseError) => ({
              code: firebaseError.code,
              message: firebaseError.message,
              operation: "verify authentication",
              success: false
            })
          ),
          (firebaseError) => ({
            code: firebaseError.code,
            message: firebaseError.message,
            operation: "verify authentication",
            success: false
          })
        ),
        (firebaseError) => ({
          code: firebaseError.code,
          message: firebaseError.message,
          operation: "verify authentication",
          success: false
        })
      ) : (userDocument.lastPresent ? options.webAuthnUserDocumentReference.update(
        {
          challenge: FieldValue2.delete()
        }
      ) : options.webAuthnUserDocumentReference.delete()).then(
        () => ({
          code: "not-verified",
          message: "User not verified.",
          operation: "verify authentication",
          success: false
        }),
        (firebaseError) => ({
          code: firebaseError.code,
          message: firebaseError.message,
          operation: "verify authentication",
          success: false
        })
      )
    ) : options.webAuthnUserDocumentReference.update(
      {
        challenge: FieldValue2.delete()
      }
    ).then(
      () => ({
        code: "user-doc-missing-passkey-fields",
        message: "User doc is missing passkey fields from prior operation.",
        operation: "verify authentication",
        success: false
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: "verify authentication",
        success: false
      })
    ) : userDocument.lastPresent ? {
      code: "user-doc-missing-challenge-field",
      message: "User doc is missing challenge field from prior operation.",
      operation: "verify authentication",
      success: false
    } : options.webAuthnUserDocumentReference.delete().then(
      () => ({
        code: "user-doc-missing-challenge-field",
        message: "User doc is missing challenge field from prior operation.",
        operation: "verify authentication",
        success: false
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: "verify authentication",
        success: false
      })
    ) : {
      code: "missing-user-doc",
      message: "No user document was found in Firestore.",
      operation: "verify authentication",
      success: false
    })(userDocumentSnapshot.data()),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: "verify authentication",
      success: false
    })
  ) : {
    code: "missing-user-doc",
    message: "No user document was found in Firestore.",
    operation: "verify authentication",
    success: false
  })(targetUserDocumentSnapshot.data()),
  (firebaseError) => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: "verify authentication",
    success: false
  })
) : options.webAuthnUserDocumentReference.update(
  {
    challenge: FieldValue2.delete()
  }
).then(
  () => ({
    code: "no-op",
    message: "No operation is needed.",
    operation: "verify authentication",
    success: false
  }),
  (firebaseError) => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: "verify authentication",
    success: false
  })
);

// libs/api/src/lib/function responses/lib/verifyReauthentication.ts
import { verifyAuthenticationResponse as verifyAuthenticationResponse2 } from "@simplewebauthn/server";
import { FieldValue as FieldValue3, Timestamp as Timestamp2 } from "firebase-admin/firestore";
var verifyReauthentication = (options) => options.webAuthnUserDocumentReference.get().then(
  (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.challenge && userDocument.challenge.process === "reauthentication" ? userDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"] ? verifyAuthenticationResponse2(
    {
      authenticator: {
        counter: userDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.counter || 0,
        credentialID: userDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.id || new Uint8Array(0),
        credentialPublicKey: userDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]?.publicKey || new Uint8Array(0)
      },
      expectedChallenge: userDocument.challenge.value,
      expectedOrigin: "https://" + options.hostname,
      expectedRPID: options.hostname,
      requireUserVerification: options.userVerificationRequirement === "required" || options.userVerificationRequirement === "preferred",
      response: options.authenticationResponse
    }
  ).then(
    (primaryVerifiedAuthenticationResponse) => primaryVerifiedAuthenticationResponse.verified ? options.webAuthnUserDocumentReference.update(
      {
        challenge: FieldValue3.delete(),
        [userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]: {
          ...userDocument[userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"],
          backupEligible: primaryVerifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice",
          backupSuccessful: primaryVerifiedAuthenticationResponse.authenticationInfo.credentialBackedUp
        },
        lastCredentialUsed: userDocument.challenge?.processingCredentialType,
        lastPresent: Timestamp2.fromDate(/* @__PURE__ */ new Date()),
        lastVerified: primaryVerifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp2.fromDate(/* @__PURE__ */ new Date()) : userDocument["lastVerified"] || FieldValue3.delete()
      }
    ).then(
      () => options.createCustomToken().then(
        (customToken) => ({
          reauthenticatedCredentialType: userDocument.challenge?.processingCredentialType || "primary",
          customToken,
          operation: "verify reauthentication",
          success: true
        }),
        (firebaseError) => ({
          code: firebaseError.code,
          message: firebaseError.message,
          operation: "verify reauthentication",
          success: false
        })
      ),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: "verify reauthentication",
        success: false
      })
    ) : options.webAuthnUserDocumentReference.update(
      {
        challenge: FieldValue3.delete()
      }
    ).then(
      () => ({
        code: "not-verified",
        message: "User not verified.",
        operation: "verify reauthentication",
        success: false
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: "verify reauthentication",
        success: false
      })
    )
  ) : options.webAuthnUserDocumentReference.update(
    {
      challenge: FieldValue3.delete()
    }
  ).then(
    () => ({
      code: "user-doc-missing-passkey-fields",
      message: "User doc is missing passkey fields from prior operation.",
      operation: "verify reauthentication",
      success: false
    }),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: "verify reauthentication",
      success: false
    })
  ) : {
    code: "user-doc-missing-challenge-field",
    message: "User doc is missing challenge field from prior operation.",
    operation: "verify reauthentication",
    success: false
  } : {
    code: "missing-user-doc",
    message: "No user document was found in Firestore.",
    operation: "verify reauthentication",
    success: false
  })(userDocumentSnapshot.data())
);

// libs/api/src/lib/function responses/lib/verifyRegistration.ts
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { FieldValue as FieldValue4, Timestamp as Timestamp3 } from "firebase-admin/firestore";
var verifyRegistration = (options) => options.webAuthnUserDocumentReference.get().then(
  (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.challenge && userDocument.challenge.process === "registration" ? (userDocument.challenge?.processingCredentialType === "backup" ? !userDocument?.credential : !userDocument?.backupCredential) ? verifyRegistrationResponse(
    {
      expectedChallenge: userDocument.challenge.value,
      expectedOrigin: "https://" + options.hostname,
      expectedRPID: options.hostname,
      requireUserVerification: options.userVerificationRequirement === "required" || options.userVerificationRequirement === "preferred",
      response: options.registrationResponse
    }
  ).then(
    (verifiedRegistrationResponse) => verifiedRegistrationResponse.verified && verifiedRegistrationResponse.registrationInfo ? options.webAuthnUserDocumentReference.update(
      {
        challenge: FieldValue4.delete(),
        [userDocument.challenge?.processingCredentialType === "backup" ? "backupCredential" : "credential"]: {
          backupEligible: verifiedRegistrationResponse.registrationInfo.credentialDeviceType === "multiDevice",
          backupSuccessful: verifiedRegistrationResponse.registrationInfo.credentialBackedUp,
          counter: verifiedRegistrationResponse.registrationInfo.counter,
          id: verifiedRegistrationResponse.registrationInfo.credentialID,
          publicKey: verifiedRegistrationResponse.registrationInfo.credentialPublicKey,
          type: userDocument.challenge?.processingCredentialType
        },
        lastPresent: Timestamp3.fromDate(/* @__PURE__ */ new Date()),
        lastVerified: verifiedRegistrationResponse.registrationInfo.userVerified ? Timestamp3.fromDate(/* @__PURE__ */ new Date()) : userDocument["lastVerified"]
      }
    ).then(
      () => options.createCustomToken().then(
        (customToken) => ({
          registeredCredentialType: userDocument.lastPresent ? "backup" : "primary",
          customToken,
          operation: "verify registration",
          success: true
        }),
        (firebaseError) => ({
          code: firebaseError.code,
          message: firebaseError.message,
          operation: "verify registration",
          success: false
        })
      ),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: "verify registration",
        success: false
      })
    ) : options.webAuthnUserDocumentReference.delete().then(
      () => ({
        code: "not-verified",
        message: "User not verified.",
        operation: "verify registration",
        success: false
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: "verify registration",
        success: false
      })
    )
  ) : options.webAuthnUserDocumentReference.delete().then(
    () => ({
      code: "user-doc-missing-passkey-fields",
      message: "User doc is missing passkey fields from prior operation.",
      operation: "verify registration",
      success: false
    }),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: "verify registration",
      success: false
    })
  ) : userDocument.lastPresent ? {
    code: "user-doc-missing-challenge-field",
    message: "User doc is missing challenge field from prior operation.",
    operation: "verify registration",
    success: false
  } : options.webAuthnUserDocumentReference.delete().then(
    () => ({
      code: "user-doc-missing-challenge-field",
      message: "User doc is missing challenge field from prior operation.",
      operation: "verify registration",
      success: false
    }),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: "verify registration",
      success: false
    })
  ) : {
    code: "missing-user-doc",
    message: "No user document was found in Firestore.",
    operation: "verify registration",
    success: false
  })(userDocumentSnapshot.data()),
  (firebaseError) => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: "verify registration",
    success: false
  })
);

// libs/api/src/lib/getFirebaseWebAuthnApi.ts
var getFirebaseWebAuthnApi = (firebaseWebAuthnConfig, app) => onCall(
  {
    enforceAppCheck: true,
    ingressSettings: "ALLOW_ALL"
  },
  async (callableRequest) => callableRequest.auth ? ((firestore) => (async (auth, userID, webAuthnUserCollectionReference, webAuthnUserDocumentReference) => callableRequest.data.operation === "clear challenge" ? clearChallenge(
    {
      webAuthnUserDocumentReference
    }
  ) : callableRequest.data.operation == "clear user doc" ? clearUserDoc(
    {
      webAuthnUserDocumentReference
    }
  ) : callableRequest.data.operation === "create authentication challenge" ? createAuthenticationChallenge(
    {
      authenticatingCredentialType: callableRequest.data.authenticatingCredentialType,
      hostname: callableRequest.rawRequest.hostname,
      userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference
    }
  ) : callableRequest.data.operation === "create reauthentication challenge" ? createReauthenticationChallenge(
    {
      hostname: callableRequest.rawRequest.hostname,
      reauthenticatingCredentialType: callableRequest.data.reauthenticatingCredentialType,
      userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference
    }
  ) : callableRequest.data.operation === "create registration challenge" ? createRegistrationChallenge(
    {
      authenticatorAttachment: firebaseWebAuthnConfig.authenticatorAttachment,
      hostname: callableRequest.rawRequest.hostname,
      registeringCredentialType: callableRequest.data.registeringCredentialType,
      relyingPartyName: firebaseWebAuthnConfig.relyingPartyName,
      userID,
      userName: callableRequest.data.name,
      userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference
    }
  ) : callableRequest.data.operation === "verify authentication" ? verifyAuthentication(
    {
      authenticationResponse: callableRequest.data.authenticationResponse,
      createCustomToken: (uid) => auth.createCustomToken(uid),
      hostname: callableRequest.rawRequest.hostname,
      userID,
      userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserCollectionReference,
      webAuthnUserDocumentReference
    }
  ) : callableRequest.data.operation === "verify reauthentication" ? verifyReauthentication(
    {
      authenticationResponse: callableRequest.data.authenticationResponse,
      createCustomToken: () => auth.createCustomToken(userID),
      hostname: callableRequest.rawRequest.hostname,
      userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference
    }
  ) : callableRequest.data.operation === "verify registration" ? verifyRegistration(
    {
      createCustomToken: () => auth.createCustomToken(userID),
      hostname: callableRequest.rawRequest.hostname,
      registrationResponse: callableRequest.data.registrationResponse,
      userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference
    }
  ) : (() => {
    throw new Error("Invalid operation.");
  })())(
    app ? getAuth(app) : getAuth(),
    callableRequest.auth.uid,
    firestore.collection("users"),
    firestore.collection("users").doc(callableRequest.auth.uid)
  ))(
    app ? getFirestore(
      app,
      "ext-firebase-web-authn"
    ) : getFirestore("ext-firebase-web-authn")
  ) : {
    code: "missing-auth",
    message: "No user is signed in.",
    operation: callableRequest.data.operation,
    success: false
  }
);

// libs/extension/functions/lib/api.ts
var api = getFirebaseWebAuthnApi(
  {
    authenticatorAttachment: process.env["AUTHENTICATOR_ATTACHMENT"],
    relyingPartyName: process.env["RELYING_PARTY_NAME"],
    userVerificationRequirement: process.env["USER_VERIFICATION_REQUIREMENT"]
  }
);

// libs/extension/functions/main.ts
getApps().length === 0 && initializeApp();
export {
  api
};
