// libs/extension/functions/main.ts
import { getApps, initializeApp } from "firebase-admin/app";

// libs/api/src/lib/getFirebaseWebAuthnApi.ts
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { runWith } from "firebase-functions";

// libs/api/src/lib/function responses/lib/clearChallenge.ts
import { FieldValue } from "firebase-admin/firestore";
var clearChallenge = (options) => options.webAuthnUserDocumentReference.get().then(
  (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.challenge ? userDocument.credential ? options.webAuthnUserDocumentReference.update(
    {
      challenge: FieldValue.delete()
    }
  ).then(
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
  ) : options.webAuthnUserDocumentReference.delete().then(
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
      challenge: publicKeyCredentialRequestOptionsJSON.challenge
    },
    {
      merge: true
    }
  ).then(
    () => ({
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
  (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.credential ? generateAuthenticationOptions2(
    {
      allowCredentials: [
        {
          id: userDocument.credential.id,
          type: "public-key"
        }
      ],
      rpID: options.hostname,
      userVerification: options.userVerificationRequirement
    }
  ).then(
    (publicKeyCredentialRequestOptions) => options.webAuthnUserDocumentReference.set(
      {
        challenge: publicKeyCredentialRequestOptions.challenge
      },
      {
        merge: true
      }
    ).then(
      () => ({
        operation: "create reauthentication challenge",
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
  (userDocumentSnapshot) => (async (userDocument) => !userDocument?.credential ? generateRegistrationOptions(
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
        challenge: publicKeyCredentialCreationOptions.challenge
      }
    ).then(
      () => ({
        creationOptions: publicKeyCredentialCreationOptions,
        operation: "create registration challenge",
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
var verifyAuthentication = (options) => options.authenticationResponse.response.userHandle !== options.userID ? options.webAuthnUserDocumentReference.get().then(
  (userDocumentSnapshot) => ((userDocument) => userDocument ? userDocument.credential ? options.webAuthnUserDocumentReference.get().then(
    (priorUserDocumentSnapshot) => ((priorUserDocument) => priorUserDocument && priorUserDocument.challenge ? verifyAuthenticationResponse(
      {
        authenticator: {
          counter: userDocument.credential?.counter || 0,
          credentialID: userDocument.credential?.id || new Uint8Array(0),
          credentialPublicKey: userDocument.credential?.publicKey || new Uint8Array(0)
        },
        expectedChallenge: priorUserDocument.challenge,
        expectedOrigin: "https://" + options.hostname,
        expectedRPID: options.hostname,
        requireUserVerification: true,
        response: options.authenticationResponse
      }
    ).then(
      (verifiedAuthenticationResponse) => verifiedAuthenticationResponse.verified ? options.webAuthnUserDocumentReference.update(
        {
          challenge: FieldValue2.delete(),
          credential: {
            ...userDocument["credential"],
            backupEligible: verifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice",
            backupSuccessful: verifiedAuthenticationResponse.authenticationInfo.credentialBackedUp
          },
          lastPresent: Timestamp.fromDate(/* @__PURE__ */ new Date()),
          lastVerified: verifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(/* @__PURE__ */ new Date()) : userDocument["lastVerified"] || FieldValue2.delete()
        }
      ).then(
        () => priorUserDocument.credential ? options.webAuthnUserDocumentReference.update(
          {
            challenge: FieldValue2.delete()
          }
        ).then(
          () => options.createCustomToken().then(
            (customToken) => ({
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
        ) : options.webAuthnUserDocumentReference.delete().then(
          () => options.createCustomToken().then(
            (customToken) => ({
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
      ) : options.webAuthnUserDocumentReference.delete().then(
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
    ) : options.webAuthnUserDocumentReference.delete().then(
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
    ))(priorUserDocumentSnapshot.data())
  ) : options.webAuthnUserDocumentReference.delete().then(
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
  ) : options.webAuthnUserDocumentReference.delete().then(
    () => ({
      code: "missing-user-doc",
      message: "No user document was found in Firestore.",
      operation: "verify authentication",
      success: false
    }),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: "verify authentication",
      success: false
    })
  ))(userDocumentSnapshot.data())
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
  (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.credential ? (async () => userDocument.challenge ? verifyAuthenticationResponse2(
    {
      authenticator: {
        counter: userDocument.credential?.counter || 0,
        credentialID: userDocument.credential?.id || new Uint8Array(0),
        credentialPublicKey: userDocument.credential?.publicKey || new Uint8Array(0)
      },
      expectedChallenge: userDocument.challenge,
      expectedOrigin: "https://" + options.hostname,
      expectedRPID: options.hostname,
      requireUserVerification: true,
      response: options.authenticationResponse
    }
  ).then(
    (verifiedAuthenticationResponse) => verifiedAuthenticationResponse.verified ? options.webAuthnUserDocumentReference.update(
      {
        challenge: FieldValue3.delete(),
        credential: {
          ...userDocument["credential"],
          backupEligible: verifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice",
          backupSuccessful: verifiedAuthenticationResponse.authenticationInfo.credentialBackedUp
        },
        lastPresent: Timestamp2.fromDate(/* @__PURE__ */ new Date()),
        lastVerified: verifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp2.fromDate(/* @__PURE__ */ new Date()) : userDocument["lastVerified"] || FieldValue3.delete()
      }
    ).then(
      () => options.createCustomToken().then(
        (customToken) => ({
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
  ) : {
    code: "user-doc-missing-challenge-field",
    message: "User doc is missing challenge field from prior operation.",
    operation: "verify reauthentication",
    success: false
  })() : options.webAuthnUserDocumentReference.delete().then(
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
  (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.challenge ? !userDocument.credential ? verifyRegistrationResponse(
    {
      expectedChallenge: userDocument["challenge"],
      expectedOrigin: "https://" + options.hostname,
      expectedRPID: options.hostname,
      requireUserVerification: true,
      response: options.registrationResponse
    }
  ).then(
    (verifiedRegistrationResponse) => verifiedRegistrationResponse.verified && verifiedRegistrationResponse.registrationInfo ? options.webAuthnUserDocumentReference.update(
      {
        challenge: FieldValue4.delete(),
        credential: {
          backupEligible: verifiedRegistrationResponse.registrationInfo.credentialDeviceType === "multiDevice",
          backupSuccessful: verifiedRegistrationResponse.registrationInfo.credentialBackedUp,
          counter: verifiedRegistrationResponse.registrationInfo.counter,
          id: verifiedRegistrationResponse.registrationInfo.credentialID,
          publicKey: verifiedRegistrationResponse.registrationInfo.credentialPublicKey
        },
        lastPresent: Timestamp3.fromDate(/* @__PURE__ */ new Date()),
        lastVerified: verifiedRegistrationResponse.registrationInfo.userVerified ? Timestamp3.fromDate(/* @__PURE__ */ new Date()) : userDocument["lastVerified"] || FieldValue4.delete()
      }
    ).then(
      () => options.createCustomToken().then(
        (customToken) => ({
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
  ) : options.webAuthnUserDocumentReference.update(
    {
      challenge: FieldValue4.delete()
    }
  ).then(
    () => ({
      code: "no-op",
      message: "No operation is needed.",
      operation: "verify registration",
      success: false
    }),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: "verify registration",
      success: false
    })
  ) : options.webAuthnUserDocumentReference.delete().then(
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
var getFirebaseWebAuthnApi = (firebaseWebAuthnConfig, app) => runWith({
  enforceAppCheck: true,
  ingressSettings: "ALLOW_ALL"
}).https.onCall(
  async (functionRequest, callableContext) => callableContext.auth ? (async (createCustomToken, userID, webAuthnUserDocumentReference) => functionRequest.operation === "clear challenge" ? clearChallenge(
    {
      webAuthnUserDocumentReference
    }
  ) : functionRequest.operation == "clear user doc" ? clearUserDoc(
    {
      webAuthnUserDocumentReference
    }
  ) : functionRequest.operation === "create authentication challenge" ? createAuthenticationChallenge(
    {
      hostname: callableContext.rawRequest.hostname,
      userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference
    }
  ) : functionRequest.operation === "create reauthentication challenge" ? createReauthenticationChallenge(
    {
      hostname: callableContext.rawRequest.hostname,
      userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference
    }
  ) : functionRequest.operation === "create registration challenge" ? createRegistrationChallenge(
    {
      authenticatorAttachment: firebaseWebAuthnConfig.authenticatorAttachment,
      hostname: callableContext.rawRequest.hostname,
      relyingPartyName: firebaseWebAuthnConfig.relyingPartyName,
      userID,
      userName: functionRequest.name,
      userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
      webAuthnUserDocumentReference
    }
  ) : functionRequest.operation === "verify authentication" ? verifyAuthentication(
    {
      authenticationResponse: functionRequest.authenticationResponse,
      createCustomToken,
      hostname: callableContext.rawRequest.hostname,
      userID,
      webAuthnUserDocumentReference
    }
  ) : functionRequest.operation === "verify reauthentication" ? verifyReauthentication(
    {
      authenticationResponse: functionRequest.authenticationResponse,
      createCustomToken,
      hostname: callableContext.rawRequest.hostname,
      webAuthnUserDocumentReference
    }
  ) : functionRequest.operation === "verify registration" ? verifyRegistration(
    {
      createCustomToken,
      hostname: callableContext.rawRequest.hostname,
      registrationResponse: functionRequest.registrationResponse,
      webAuthnUserDocumentReference
    }
  ) : (() => {
    throw new Error("Invalid operation.");
  })())(
    ((auth) => () => auth.createCustomToken(callableContext.auth?.uid || ""))(app ? getAuth(app) : getAuth()),
    callableContext.auth.uid,
    ((firestore) => firestore.collection("users").doc(callableContext.auth?.uid || ""))(app ? getFirestore(
      app,
      "ext-firebase-web-authn"
    ) : getFirestore("ext-firebase-web-authn"))
  ) : {
    code: "missing-auth",
    message: "No user is signed in.",
    operation: functionRequest.operation,
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
