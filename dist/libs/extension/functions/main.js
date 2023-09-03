// libs/extension/functions/main.ts
import { getApps, initializeApp } from "firebase-admin/app";

// libs/api/src/lib/getFirebaseWebAuthnApi.ts
import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { runWith } from "firebase-functions";
var getFirebaseWebAuthnApi = (firebaseWebAuthnConfig, app) => runWith({
  enforceAppCheck: true,
  ingressSettings: "ALLOW_ALL"
}).https.onCall(
  async (functionRequest, callableContext) => callableContext.auth ? (async (auth, firestore) => functionRequest.operation === "clear challenge" ? firestore.collection("users").doc(callableContext.auth?.uid || "").get().then(
    (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.challenge ? userDocument.credential ? firestore.collection("users").doc(callableContext.auth?.uid || "").update(
      {
        challenge: FieldValue.delete()
      }
    ).then(
      () => ({
        operation: functionRequest.operation,
        success: true
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: functionRequest.operation,
        success: false
      })
    ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then(
      () => ({
        operation: functionRequest.operation,
        success: true
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: functionRequest.operation,
        success: false
      })
    ) : {
      code: "no-op",
      message: "No operation is needed.",
      operation: functionRequest.operation,
      success: false
    } : {
      code: "missing-user-doc",
      message: "No user document was found in Firestore.",
      operation: functionRequest.operation,
      success: false
    })(userDocumentSnapshot.data()),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: functionRequest.operation,
      success: false
    })
  ) : functionRequest.operation == "clear user doc" ? firestore.collection("users").doc(callableContext.auth?.uid || "").get().then(
    (userDocumentSnapshot) => (async (userDocument) => userDocument ? firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then(
      () => ({
        operation: functionRequest.operation,
        success: true
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: functionRequest.operation,
        success: false
      })
    ) : {
      code: "no-op",
      message: "No operation is needed.",
      operation: functionRequest.operation,
      success: false
    })(userDocumentSnapshot.data()),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: functionRequest.operation,
      success: false
    })
  ) : functionRequest.operation === "create authentication challenge" ? generateAuthenticationOptions(
    {
      rpID: callableContext.rawRequest.hostname,
      userVerification: firebaseWebAuthnConfig.userVerificationRequirement
    }
  ).then(
    (publicKeyCredentialRequestOptionsJSON) => firestore.collection("users").doc(callableContext.auth?.uid || "").set(
      {
        challenge: publicKeyCredentialRequestOptionsJSON.challenge
      },
      {
        merge: true
      }
    ).then(
      () => ({
        requestOptions: publicKeyCredentialRequestOptionsJSON,
        operation: functionRequest.operation,
        success: true
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: functionRequest.operation,
        success: false
      })
    )
  ) : functionRequest.operation === "create reauthentication challenge" ? firestore.collection("users").doc(callableContext.auth?.uid || "").get().then(
    (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.credential ? generateAuthenticationOptions(
      {
        allowCredentials: [
          {
            id: userDocument.credential.id,
            type: "public-key"
          }
        ],
        rpID: callableContext.rawRequest.hostname,
        userVerification: firebaseWebAuthnConfig.userVerificationRequirement
      }
    ).then(
      (publicKeyCredentialRequestOptions) => firestore.collection("users").doc(callableContext.auth?.uid || "").set(
        {
          challenge: publicKeyCredentialRequestOptions.challenge
        },
        {
          merge: true
        }
      ).then(
        () => ({
          requestOptions: publicKeyCredentialRequestOptions,
          operation: functionRequest.operation,
          success: true
        }),
        (firebaseError) => ({
          code: firebaseError.code,
          message: firebaseError.message,
          operation: functionRequest.operation,
          success: false
        })
      )
    ) : {
      code: "user-doc-missing-passkey-fields",
      message: "User doc is missing passkey fields from prior operation.",
      operation: functionRequest.operation,
      success: false
    } : {
      code: "missing-user-doc",
      message: "No user document was found in Firestore.",
      operation: functionRequest.operation,
      success: false
    })(userDocumentSnapshot.data()),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: functionRequest.operation,
      success: false
    })
  ) : functionRequest.operation === "create registration challenge" ? firestore.collection("users").doc(callableContext.auth?.uid || "").get().then(
    (userDocumentSnapshot) => (async (userDocument) => !userDocument?.credential ? generateRegistrationOptions(
      {
        authenticatorSelection: {
          authenticatorAttachment: firebaseWebAuthnConfig.authenticatorAttachment,
          residentKey: "required",
          userVerification: firebaseWebAuthnConfig.userVerificationRequirement
        },
        rpID: callableContext.rawRequest.hostname,
        rpName: firebaseWebAuthnConfig.relyingPartyName,
        userID: callableContext.auth?.uid || "",
        userName: functionRequest.name
      }
    ).then(
      (publicKeyCredentialCreationOptions) => firestore.collection("users").doc(callableContext.auth?.uid || "").set(
        {
          challenge: publicKeyCredentialCreationOptions.challenge
        }
      ).then(
        () => ({
          creationOptions: publicKeyCredentialCreationOptions,
          operation: functionRequest.operation,
          success: true
        }),
        (firebaseError) => ({
          code: firebaseError.code,
          message: firebaseError.message,
          operation: functionRequest.operation,
          success: false
        })
      )
    ) : {
      code: "no-op",
      message: "No operation is needed.",
      operation: functionRequest.operation,
      success: false
    })(userDocumentSnapshot.data()),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: functionRequest.operation,
      success: false
    })
  ) : functionRequest.operation === "verify authentication" ? functionRequest.authenticationResponse.response.userHandle !== callableContext.auth?.uid ? firestore.collection("users").doc(functionRequest.authenticationResponse.response.userHandle || "").get().then(
    (userDocumentSnapshot) => ((userDocument) => userDocument ? userDocument.credential ? firestore.collection("users").doc(callableContext.auth?.uid || "").get().then(
      (priorUserDocumentSnapshot) => ((priorUserDocument) => priorUserDocument && priorUserDocument.challenge ? verifyAuthenticationResponse(
        {
          authenticator: {
            counter: userDocument.credential?.counter || 0,
            credentialID: userDocument.credential?.id || new Uint8Array(0),
            credentialPublicKey: userDocument.credential?.publicKey || new Uint8Array(0)
          },
          expectedChallenge: priorUserDocument.challenge,
          expectedOrigin: "https://" + callableContext.rawRequest.hostname,
          expectedRPID: callableContext.rawRequest.hostname,
          requireUserVerification: true,
          response: functionRequest.authenticationResponse
        }
      ).then(
        (verifiedAuthenticationResponse) => verifiedAuthenticationResponse.verified ? firestore.collection("users").doc(functionRequest.authenticationResponse.response.userHandle || "").update(
          {
            challenge: FieldValue.delete(),
            credential: {
              ...userDocument["credential"],
              backupEligible: verifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice",
              backupSuccessful: verifiedAuthenticationResponse.authenticationInfo.credentialBackedUp
            },
            lastPresent: Timestamp.fromDate(/* @__PURE__ */ new Date()),
            lastVerified: verifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(/* @__PURE__ */ new Date()) : userDocument["lastVerified"] || FieldValue.delete()
          }
        ).then(
          () => priorUserDocument.credential ? firestore.collection("users").doc(callableContext.auth?.uid || "").update(
            {
              challenge: FieldValue.delete()
            }
          ).then(
            () => auth.createCustomToken(functionRequest.authenticationResponse.response.userHandle || "").then(
              (customToken) => ({
                customToken,
                operation: functionRequest.operation,
                success: true
              }),
              (firebaseError) => ({
                code: firebaseError.code,
                message: firebaseError.message,
                operation: functionRequest.operation,
                success: false
              })
            ),
            (firebaseError) => ({
              code: firebaseError.code,
              message: firebaseError.message,
              operation: functionRequest.operation,
              success: false
            })
          ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then(
            () => auth.createCustomToken(functionRequest.authenticationResponse.response.userHandle || "").then(
              (customToken) => ({
                customToken,
                operation: functionRequest.operation,
                success: true
              }),
              (firebaseError) => ({
                code: firebaseError.code,
                message: firebaseError.message,
                operation: functionRequest.operation,
                success: false
              })
            ),
            (firebaseError) => ({
              code: firebaseError.code,
              message: firebaseError.message,
              operation: functionRequest.operation,
              success: false
            })
          ),
          (firebaseError) => ({
            code: firebaseError.code,
            message: firebaseError.message,
            operation: functionRequest.operation,
            success: false
          })
        ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then(
          () => ({
            code: "not-verified",
            message: "User not verified.",
            operation: functionRequest.operation,
            success: false
          }),
          (firebaseError) => ({
            code: firebaseError.code,
            message: firebaseError.message,
            operation: functionRequest.operation,
            success: false
          })
        )
      ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then(
        () => ({
          code: "user-doc-missing-challenge-field",
          message: "User doc is missing challenge field from prior operation.",
          operation: functionRequest.operation,
          success: false
        }),
        (firebaseError) => ({
          code: firebaseError.code,
          message: firebaseError.message,
          operation: functionRequest.operation,
          success: false
        })
      ))(priorUserDocumentSnapshot.data())
    ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then(
      () => ({
        code: "user-doc-missing-passkey-fields",
        message: "User doc is missing passkey fields from prior operation.",
        operation: functionRequest.operation,
        success: false
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: functionRequest.operation,
        success: false
      })
    ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then(
      () => ({
        code: "missing-user-doc",
        message: "No user document was found in Firestore.",
        operation: functionRequest.operation,
        success: false
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: functionRequest.operation,
        success: false
      })
    ))(userDocumentSnapshot.data())
  ) : firestore.collection("users").doc(callableContext.auth?.uid || "").update(
    {
      challenge: FieldValue.delete()
    }
  ).then(
    () => ({
      code: "no-op",
      message: "No operation is needed.",
      operation: functionRequest.operation,
      success: false
    }),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: functionRequest.operation,
      success: false
    })
  ) : functionRequest.operation === "verify reauthentication" ? firestore.collection("users").doc(callableContext.auth?.uid || "").get().then(
    (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.credential ? (async () => userDocument.challenge ? verifyAuthenticationResponse(
      {
        authenticator: {
          counter: userDocument.credential?.counter || 0,
          credentialID: userDocument.credential?.id || new Uint8Array(0),
          credentialPublicKey: userDocument.credential?.publicKey || new Uint8Array(0)
        },
        expectedChallenge: userDocument.challenge,
        expectedOrigin: "https://" + callableContext.rawRequest.hostname,
        expectedRPID: callableContext.rawRequest.hostname,
        requireUserVerification: true,
        response: functionRequest.authenticationResponse
      }
    ).then(
      (verifiedAuthenticationResponse) => verifiedAuthenticationResponse.verified ? firestore.collection("users").doc(callableContext.auth?.uid || "").update(
        {
          challenge: FieldValue.delete(),
          credential: {
            ...userDocument["credential"],
            backupEligible: verifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice",
            backupSuccessful: verifiedAuthenticationResponse.authenticationInfo.credentialBackedUp
          },
          lastPresent: Timestamp.fromDate(/* @__PURE__ */ new Date()),
          lastVerified: verifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(/* @__PURE__ */ new Date()) : userDocument["lastVerified"] || FieldValue.delete()
        }
      ).then(
        () => auth.createCustomToken(callableContext.auth?.uid || "").then(
          (customToken) => ({
            customToken,
            operation: functionRequest.operation,
            success: true
          }),
          (firebaseError) => ({
            code: firebaseError.code,
            message: firebaseError.message,
            operation: functionRequest.operation,
            success: false
          })
        ),
        (firebaseError) => ({
          code: firebaseError.code,
          message: firebaseError.message,
          operation: functionRequest.operation,
          success: false
        })
      ) : firestore.collection("users").doc(callableContext.auth?.uid || "").update(
        {
          challenge: FieldValue.delete()
        }
      ).then(
        () => ({
          code: "not-verified",
          message: "User not verified.",
          operation: functionRequest.operation,
          success: false
        }),
        (firebaseError) => ({
          code: firebaseError.code,
          message: firebaseError.message,
          operation: functionRequest.operation,
          success: false
        })
      )
    ) : {
      code: "user-doc-missing-challenge-field",
      message: "User doc is missing challenge field from prior operation.",
      operation: functionRequest.operation,
      success: false
    })() : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then(
      () => ({
        code: "user-doc-missing-passkey-fields",
        message: "User doc is missing passkey fields from prior operation.",
        operation: functionRequest.operation,
        success: false
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: functionRequest.operation,
        success: false
      })
    ) : {
      code: "missing-user-doc",
      message: "No user document was found in Firestore.",
      operation: functionRequest.operation,
      success: false
    })(userDocumentSnapshot.data())
  ) : functionRequest.operation === "verify registration" ? firestore.collection("users").doc(callableContext.auth?.uid || "").get().then(
    (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.challenge ? !userDocument.credential ? verifyRegistrationResponse(
      {
        expectedChallenge: userDocument["challenge"],
        expectedOrigin: "https://" + callableContext.rawRequest.hostname,
        expectedRPID: callableContext.rawRequest.hostname,
        requireUserVerification: true,
        response: functionRequest.registrationResponse
      }
    ).then(
      (verifiedRegistrationResponse) => verifiedRegistrationResponse.verified && verifiedRegistrationResponse.registrationInfo ? firestore.collection("users").doc(callableContext.auth?.uid || "").update(
        {
          challenge: FieldValue.delete(),
          credential: {
            backupEligible: verifiedRegistrationResponse.registrationInfo.credentialDeviceType === "multiDevice",
            backupSuccessful: verifiedRegistrationResponse.registrationInfo.credentialBackedUp,
            counter: verifiedRegistrationResponse.registrationInfo.counter,
            id: verifiedRegistrationResponse.registrationInfo.credentialID,
            publicKey: verifiedRegistrationResponse.registrationInfo.credentialPublicKey
          },
          lastPresent: Timestamp.fromDate(/* @__PURE__ */ new Date()),
          lastVerified: verifiedRegistrationResponse.registrationInfo.userVerified ? Timestamp.fromDate(/* @__PURE__ */ new Date()) : userDocument["lastVerified"] || FieldValue.delete()
        }
      ).then(
        () => auth.createCustomToken(callableContext.auth?.uid || "").then(
          (customToken) => ({
            customToken,
            operation: functionRequest.operation,
            success: true
          }),
          (firebaseError) => ({
            code: firebaseError.code,
            message: firebaseError.message,
            operation: functionRequest.operation,
            success: false
          })
        ),
        (firebaseError) => ({
          code: firebaseError.code,
          message: firebaseError.message,
          operation: functionRequest.operation,
          success: false
        })
      ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then(
        () => ({
          code: "not-verified",
          message: "User not verified.",
          operation: functionRequest.operation,
          success: false
        }),
        (firebaseError) => ({
          code: firebaseError.code,
          message: firebaseError.message,
          operation: functionRequest.operation,
          success: false
        })
      )
    ) : firestore.collection("users").doc(callableContext.auth?.uid || "").update(
      {
        challenge: FieldValue.delete()
      }
    ).then(
      () => ({
        code: "no-op",
        message: "No operation is needed.",
        operation: functionRequest.operation,
        success: false
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: functionRequest.operation,
        success: false
      })
    ) : firestore.collection("users").doc(callableContext.auth?.uid || "").delete().then(
      () => ({
        code: "user-doc-missing-challenge-field",
        message: "User doc is missing challenge field from prior operation.",
        operation: functionRequest.operation,
        success: false
      }),
      (firebaseError) => ({
        code: firebaseError.code,
        message: firebaseError.message,
        operation: functionRequest.operation,
        success: false
      })
    ) : {
      code: "missing-user-doc",
      message: "No user document was found in Firestore.",
      operation: functionRequest.operation,
      success: false
    })(userDocumentSnapshot.data()),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: functionRequest.operation,
      success: false
    })
  ) : (() => {
    throw new Error("Invalid function request type.");
  })())(
    app ? getAuth(app) : getAuth(),
    app ? getFirestore(
      app,
      "ext-firebase-web-authn"
    ) : getFirestore("ext-firebase-web-authn")
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
