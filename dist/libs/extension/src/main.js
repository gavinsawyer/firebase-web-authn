// libs/extension/src/main.ts
import { getApps, initializeApp } from "firebase-admin/app";

// libs/api/src/lib/getFirebaseWebAuthnApi.ts
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

// libs/api/src/lib/operations/lib/clearChallenge.ts
import { FieldValue } from "firebase-admin/firestore";
function clearChallenge(options) {
  const webAuthnUserDocumentReference = options.firestore.collection("users").doc(options.userId);
  return webAuthnUserDocumentReference.get().then(
    (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.challenge ? (userDocument.credentials ? webAuthnUserDocumentReference.update(
      {
        challenge: FieldValue.delete()
      }
    ) : webAuthnUserDocumentReference.delete()).then(
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
}

// libs/api/src/lib/operations/lib/clearCredential.ts
import { FieldValue as FieldValue2 } from "firebase-admin/firestore";
var clearCredential = (options) => options.webAuthnUserDocumentReference.get().then(
  (userDocumentSnapshot) => (async (userDocument) => userDocument && userDocument.credentials?.[options.clearingCredential || "first"] ? options.webAuthnUserDocumentReference.update(
    {
      ["credentials." + (options.clearingCredential || "first")]: FieldValue2.delete()
    }
  ).then(
    () => ({
      clearingCredential: options.clearingCredential,
      operation: "clear credential",
      success: true
    }),
    (firebaseError) => ({
      code: firebaseError.code,
      message: firebaseError.message,
      operation: "clear credential",
      success: false
    })
  ) : {
    code: "no-op",
    message: "No operation is needed.",
    operation: "clear credential",
    success: false
  })(userDocumentSnapshot.data()),
  (firebaseError) => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: "clear credential",
    success: false
  })
);

// libs/api/src/lib/operations/lib/createAuthenticationChallenge.ts
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { FieldValue as FieldValue3 } from "firebase-admin/firestore";
var createAuthenticationChallenge = (options) => generateAuthenticationOptions(options.authenticationOptions).then(
  (publicKeyCredentialRequestOptionsJSON) => options.webAuthnUserDocumentReference.set(
    {
      challenge: {
        process: "authentication",
        processingCredential: options.authenticatingCredential || FieldValue3.delete(),
        value: publicKeyCredentialRequestOptionsJSON.challenge
      }
    },
    {
      merge: true
    }
  ).then(
    () => ({
      authenticatingCredential: options.authenticatingCredential,
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

// libs/api/src/lib/operations/lib/createReauthenticationChallenge.ts
import { generateAuthenticationOptions as generateAuthenticationOptions2 } from "@simplewebauthn/server";
import { FieldValue as FieldValue4 } from "firebase-admin/firestore";
var createReauthenticationChallenge = (options) => options.webAuthnUserDocumentReference.get().then(
  (userDocumentSnapshot) => (async (userDocument) => userDocument ? (options.reauthenticatingCredentialFactor === "second" ? userDocument.credentials?.second : userDocument.credentials?.first) ? generateAuthenticationOptions2(
    {
      ...options.authenticationOptions,
      allowCredentials: options.reauthenticatingCredentialFactor ? [
        {
          id: userDocument.credentials?.[options.reauthenticatingCredentialFactor]?.id || new Uint8Array(),
          type: "public-key"
        }
      ] : userDocument.credentials?.second ? [
        {
          id: userDocument.credentials.first.id || new Uint8Array(),
          type: "public-key"
        },
        {
          id: userDocument.credentials.second.id,
          type: "public-key"
        }
      ] : [
        {
          id: userDocument.credentials?.first.id || new Uint8Array(),
          type: "public-key"
        }
      ]
    }
  ).then(
    (publicKeyCredentialRequestOptions) => options.webAuthnUserDocumentReference.set(
      {
        challenge: {
          process: "reauthentication",
          processingCredential: options.reauthenticatingCredentialFactor || FieldValue4.delete(),
          value: publicKeyCredentialRequestOptions.challenge
        }
      },
      {
        merge: true
      }
    ).then(
      () => ({
        operation: "create reauthentication challenge",
        reauthenticatingCredential: options.reauthenticatingCredentialFactor,
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

// libs/api/src/lib/operations/lib/createRegistrationChallenge.ts
import { generateRegistrationOptions } from "@simplewebauthn/server";
var createRegistrationChallenge = (options) => options.webAuthnUserDocumentReference.get().then(
  (userDocumentSnapshot) => (async (userDocument) => (options.registeringCredentialFactor === "second" ? !userDocument?.credentials?.second : !userDocument?.credentials?.first) ? options.registeringCredentialFactor !== "second" || userDocument && userDocument.credentials?.first ? generateRegistrationOptions(
    {
      ...options.registrationOptions,
      excludeCredentials: options.registeringCredentialFactor === "second" ? [
        {
          id: userDocument?.credentials?.first.id || new Uint8Array(),
          type: "public-key"
        }
      ] : void 0
    }
  ).then(
    (publicKeyCredentialCreationOptions) => options.webAuthnUserDocumentReference.set(
      {
        challenge: {
          process: "registration",
          processingCredential: options.registeringCredentialFactor,
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
        registeringCredential: options.registeringCredentialFactor,
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

// libs/api/src/lib/operations/lib/verifyAuthentication.ts
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { FieldValue as FieldValue5, Timestamp } from "firebase-admin/firestore";
var verifyAuthentication = (options) => options.authenticationOptions.response.response.userHandle !== options.userID ? options.webAuthnUserDocumentReferenceTarget.get().then(
  (userDocumentSnapshotTarget) => (async (userDocumentTarget) => userDocumentTarget ? options.webAuthnUserDocumentReference.get().then(
    (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.challenge && userDocument.challenge.process === "authentication" ? userDocumentTarget.credentials?.[userDocument.challenge?.processingCredential || "first"] ? verifyAuthenticationResponse(
      {
        ...options.authenticationOptions,
        authenticator: {
          counter: userDocumentTarget.credentials[userDocument.challenge.processingCredential || "first"]?.counter || 0,
          credentialID: userDocumentTarget.credentials[userDocument.challenge.processingCredential || "first"]?.id || new Uint8Array(),
          credentialPublicKey: userDocumentTarget.credentials[userDocument.challenge.processingCredential || "first"]?.publicKey || new Uint8Array()
        },
        expectedChallenge: userDocument.challenge.value,
        requireUserVerification: (userDocument.challenge.processingCredential === "second" && options.authenticatorAttachment2FA || options.authenticatorAttachment) === "platform" && options.userVerificationRequirement !== "discouraged"
      }
    ).then(
      (verifiedAuthenticationResponse) => (userDocument.lastPresent ? options.webAuthnUserDocumentReference.update(
        {
          challenge: FieldValue5.delete()
        }
      ) : options.webAuthnUserDocumentReference.delete()).then(
        () => verifiedAuthenticationResponse.verified ? options.createCustomToken(options.authenticationOptions.response.response.userHandle || "").then(
          (customToken) => options.webAuthnUserDocumentReferenceTarget.update(
            {
              challenge: FieldValue5.delete(),
              [userDocument.challenge?.processingCredential === "second" ? "credentials.second" : "credentials.first"]: {
                ...userDocumentTarget.credentials?.[userDocument.challenge?.processingCredential || "first"],
                authenticatorAttachment: verifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice" ? "platform" : "cross-platform",
                backedUp: verifiedAuthenticationResponse.authenticationInfo.credentialBackedUp
              },
              lastCredentialUsed: "first",
              lastPresent: Timestamp.fromDate(/* @__PURE__ */ new Date()),
              lastVerified: verifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(/* @__PURE__ */ new Date()) : userDocumentTarget.lastVerified || FieldValue5.delete(),
              lastWebAuthnProcess: "authentication"
            }
          ).then(
            () => ({
              authenticatedCredential: userDocument.challenge?.processingCredential || "first",
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
        ) : userDocument.challenge?.processingCredential === void 0 && userDocumentTarget.credentials?.second ? verifyAuthenticationResponse(
          {
            ...options.authenticationOptions,
            authenticator: {
              counter: userDocumentTarget.credentials.second.counter,
              credentialID: userDocumentTarget.credentials.second.id,
              credentialPublicKey: userDocumentTarget.credentials.second.publicKey
            },
            expectedChallenge: userDocument.challenge?.value || ""
          }
        ).then(
          (backupVerifiedAuthenticationResponse) => backupVerifiedAuthenticationResponse.verified ? options.createCustomToken(options.authenticationOptions.response.response.userHandle || "").then(
            (customToken) => options.webAuthnUserDocumentReferenceTarget.update(
              {
                challenge: FieldValue5.delete(),
                "credentials.second": {
                  ...userDocumentTarget.credentials?.second,
                  authenticatorAttachment: backupVerifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice" ? "platform" : "cross-platform",
                  backedUp: backupVerifiedAuthenticationResponse.authenticationInfo.credentialBackedUp
                },
                lastCredentialUsed: "second",
                lastPresent: Timestamp.fromDate(/* @__PURE__ */ new Date()),
                lastVerified: backupVerifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp.fromDate(/* @__PURE__ */ new Date()) : userDocumentTarget.lastVerified || FieldValue5.delete(),
                lastWebAuthnProcess: "authentication"
              }
            ).then(
              () => ({
                authenticatedCredential: "second",
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
          ) : (userDocument.credentials ? options.webAuthnUserDocumentReference.update(
            {
              challenge: FieldValue5.delete()
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
        ) : (userDocument.credentials ? options.webAuthnUserDocumentReference.update(
          {
            challenge: FieldValue5.delete()
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
        ),
        (firebaseError) => ({
          code: firebaseError.code,
          message: firebaseError.message,
          operation: "verify authentication",
          success: false
        })
      )
    ) : options.webAuthnUserDocumentReference.update(
      {
        challenge: FieldValue5.delete()
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
    ) : userDocument.credentials ? {
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
  })(userDocumentSnapshotTarget.data()),
  (firebaseError) => ({
    code: firebaseError.code,
    message: firebaseError.message,
    operation: "verify authentication",
    success: false
  })
) : options.webAuthnUserDocumentReference.update(
  {
    challenge: FieldValue5.delete()
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

// libs/api/src/lib/operations/lib/verifyReauthentication.ts
import { verifyAuthenticationResponse as verifyAuthenticationResponse2 } from "@simplewebauthn/server";
import { FieldValue as FieldValue6, Timestamp as Timestamp2 } from "firebase-admin/firestore";
var verifyReauthentication = (options) => options.webAuthnUserDocumentReference.get().then(
  (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.challenge && userDocument.challenge.process === "reauthentication" ? userDocument.credentials?.[userDocument.challenge?.processingCredential || "first"] ? verifyAuthenticationResponse2(
    {
      ...options.authenticationOptions,
      authenticator: {
        counter: userDocument?.credentials[userDocument.challenge.processingCredential || "first"]?.counter || 0,
        credentialID: userDocument?.credentials[userDocument.challenge.processingCredential || "first"]?.id || new Uint8Array(),
        credentialPublicKey: userDocument?.credentials[userDocument.challenge.processingCredential || "first"]?.publicKey || new Uint8Array()
      },
      expectedChallenge: userDocument.challenge.value,
      requireUserVerification: (userDocument.challenge.processingCredential === "second" && options.authenticatorAttachment2FA || options.authenticatorAttachment) === "platform" && options.userVerificationRequirement === "required"
    }
  ).then(
    (verifiedAuthenticationResponse) => verifiedAuthenticationResponse.verified ? options.createCustomToken().then(
      (customToken) => options.webAuthnUserDocumentReference.update(
        {
          challenge: FieldValue6.delete(),
          [userDocument.challenge?.processingCredential === "second" ? "credentials.second" : "credentials.first"]: {
            ...userDocument.credentials?.[userDocument.challenge?.processingCredential || "first"],
            authenticatorAttachment: verifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice" ? "platform" : "cross-platform",
            backedUp: verifiedAuthenticationResponse.authenticationInfo.credentialBackedUp
          },
          lastCredentialUsed: userDocument.challenge?.processingCredential || "first",
          lastPresent: Timestamp2.fromDate(/* @__PURE__ */ new Date()),
          lastVerified: verifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp2.fromDate(/* @__PURE__ */ new Date()) : userDocument.lastVerified || FieldValue6.delete(),
          lastWebAuthnProcess: "reauthentication"
        }
      ).then(
        () => ({
          reauthenticatedCredential: userDocument.challenge?.processingCredential || "first",
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
    ) : userDocument.challenge?.processingCredential === void 0 && userDocument.credentials?.second ? verifyAuthenticationResponse2(
      {
        ...options.authenticationOptions,
        authenticator: {
          counter: userDocument.credentials.second.counter,
          credentialID: userDocument.credentials.second.id,
          credentialPublicKey: userDocument.credentials.second.publicKey
        },
        expectedChallenge: userDocument.challenge?.value || ""
      }
    ).then(
      (backupVerifiedAuthenticationResponse) => backupVerifiedAuthenticationResponse.verified ? options.createCustomToken().then(
        (customToken) => options.webAuthnUserDocumentReference.update(
          {
            challenge: FieldValue6.delete(),
            "credentials.second": {
              ...userDocument.credentials?.second,
              authenticatorAttachment: backupVerifiedAuthenticationResponse.authenticationInfo.credentialDeviceType === "multiDevice" ? "platform" : "cross-platform",
              backedUp: backupVerifiedAuthenticationResponse.authenticationInfo.credentialBackedUp
            },
            lastCredentialUsed: "second",
            lastPresent: Timestamp2.fromDate(/* @__PURE__ */ new Date()),
            lastVerified: backupVerifiedAuthenticationResponse.authenticationInfo.userVerified ? Timestamp2.fromDate(/* @__PURE__ */ new Date()) : userDocument.lastVerified || FieldValue6.delete(),
            lastWebAuthnProcess: "reauthentication"
          }
        ).then(
          () => ({
            reauthenticatedCredential: "second",
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
          challenge: FieldValue6.delete()
        }
      ).then(
        () => ({
          code: "not-verified",
          message: "User not verified. 2",
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
        challenge: FieldValue6.delete()
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
      challenge: FieldValue6.delete()
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

// libs/api/src/lib/operations/lib/verifyRegistration.ts
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { FieldValue as FieldValue7, Timestamp as Timestamp3 } from "firebase-admin/firestore";
var verifyRegistration = (options) => options.webAuthnUserDocumentReference.get().then(
  (userDocumentSnapshot) => (async (userDocument) => userDocument ? userDocument.challenge && userDocument.challenge.process === "registration" ? userDocument.challenge.processingCredential !== "second" || userDocument.credentials?.first ? verifyRegistrationResponse(
    {
      ...options.registrationOptions,
      expectedChallenge: userDocument.challenge.value,
      requireUserVerification: (userDocument.challenge.processingCredential === "second" ? options.authenticatorAttachment2FA === "platform" : options.authenticatorAttachment === "platform") && options.userVerificationRequirement === "required"
    }
  ).then(
    (verifiedRegistrationResponse) => verifiedRegistrationResponse.verified ? options.createCustomToken().then(
      (customToken) => options.webAuthnUserDocumentReference.update(
        {
          challenge: FieldValue7.delete(),
          [userDocument.challenge?.processingCredential === "second" ? "credentials.second" : "credentials.first"]: {
            authenticatorAttachment: verifiedRegistrationResponse.registrationInfo?.credentialDeviceType === "multiDevice" ? "platform" : "cross-platform",
            backedUp: verifiedRegistrationResponse.registrationInfo?.credentialBackedUp,
            counter: verifiedRegistrationResponse.registrationInfo?.counter,
            id: verifiedRegistrationResponse.registrationInfo?.credentialID,
            publicKey: verifiedRegistrationResponse.registrationInfo?.credentialPublicKey
          },
          lastCredentialUsed: userDocument.challenge?.processingCredential || "first",
          lastPresent: Timestamp3.fromDate(/* @__PURE__ */ new Date()),
          lastVerified: verifiedRegistrationResponse.registrationInfo?.userVerified ? Timestamp3.fromDate(/* @__PURE__ */ new Date()) : userDocument.lastVerified || FieldValue7.delete(),
          lastWebAuthnProcess: "registration"
        }
      ).then(
        () => ({
          registeredCredential: userDocument.challenge?.processingCredential || "first",
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
        operation: "verify reauthentication",
        success: false
      })
    ) : (userDocument.credentials ? options.webAuthnUserDocumentReference.update(
      {
        challenge: FieldValue7.delete()
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
  ) : userDocument.credentials?.first ? {
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
function getFirebaseWebAuthnApi(firebaseWebAuthnConfig, app) {
  return onCall(
    {
      enforceAppCheck: true,
      ingressSettings: "ALLOW_ALL"
    },
    async (callableRequest) => {
      if (callableRequest.auth) {
        const auth = app ? getAuth(app) : getAuth();
        const firestore = app ? getFirestore(
          app,
          "ext-firebase-web-authn"
        ) : getFirestore("ext-firebase-web-authn");
        const userID = callableRequest.auth.uid;
        const webAuthnUserDocumentReference = firestore.collection("users").doc(callableRequest.auth.uid);
        const webAuthnUserDocumentReferenceTarget = firestore.collection("users").doc(callableRequest.data.operation === "verify authentication" && callableRequest.data.authenticationResponse.response.userHandle || callableRequest.auth.uid);
        switch (callableRequest.data.operation) {
          case "clear challenge":
            return clearChallenge(
              {
                firestore,
                userId: callableRequest.auth.uid
              }
            );
          case "clear credential":
            return clearCredential(
              {
                clearingCredential: callableRequest.data.clearingCredential,
                webAuthnUserDocumentReference
              }
            );
          case "create authentication challenge":
            return createAuthenticationChallenge(
              {
                authenticatingCredential: callableRequest.data.authenticatingCredential,
                authenticationOptions: {
                  attestationType: "indirect",
                  rpID: firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
                  supportedAlgorithmIDs: [
                    -7,
                    -8,
                    -257
                  ]
                },
                webAuthnUserDocumentReference
              }
            );
          case "create reauthentication challenge":
            return createReauthenticationChallenge(
              {
                authenticationOptions: {
                  attestationType: "indirect",
                  rpID: firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
                  supportedAlgorithmIDs: [
                    -7,
                    -8,
                    -257
                  ]
                },
                reauthenticatingCredentialFactor: callableRequest.data.reauthenticatingCredential,
                webAuthnUserDocumentReference
              }
            );
          case "create registration challenge":
            return createRegistrationChallenge(
              {
                registeringCredentialFactor: callableRequest.data.registeringCredential,
                registrationOptions: {
                  attestationType: "indirect",
                  authenticatorSelection: callableRequest.data.registeringCredential === "second" && firebaseWebAuthnConfig.authenticatorAttachment2FA ? {
                    authenticatorAttachment: firebaseWebAuthnConfig.authenticatorAttachment2FA,
                    residentKey: "preferred",
                    userVerification: firebaseWebAuthnConfig.authenticatorAttachment2FA === "platform" && firebaseWebAuthnConfig.userVerificationRequirement !== "discouraged" ? firebaseWebAuthnConfig.userVerificationRequirement : "preferred"
                  } : firebaseWebAuthnConfig.authenticatorAttachment ? {
                    authenticatorAttachment: firebaseWebAuthnConfig.authenticatorAttachment,
                    residentKey: "preferred",
                    userVerification: firebaseWebAuthnConfig.authenticatorAttachment === "platform" && firebaseWebAuthnConfig.userVerificationRequirement !== "discouraged" ? firebaseWebAuthnConfig.userVerificationRequirement : "preferred"
                  } : {
                    residentKey: "preferred",
                    userVerification: "preferred"
                  },
                  rpID: firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
                  rpName: firebaseWebAuthnConfig.relyingPartyName,
                  supportedAlgorithmIDs: [
                    -7,
                    -8,
                    -257
                  ],
                  userID,
                  userName: callableRequest.data.name
                },
                webAuthnUserDocumentReference
              }
            );
          case "verify authentication":
            return verifyAuthentication(
              {
                authenticationOptions: {
                  expectedOrigin: callableRequest.rawRequest.headers.origin || "",
                  expectedRPID: firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
                  requireUserVerification: (firebaseWebAuthnConfig.authenticatorAttachment2FA || firebaseWebAuthnConfig.authenticatorAttachment) === "platform" && firebaseWebAuthnConfig.userVerificationRequirement !== "discouraged",
                  response: callableRequest.data.authenticationResponse
                },
                authenticatorAttachment: firebaseWebAuthnConfig.authenticatorAttachment,
                authenticatorAttachment2FA: firebaseWebAuthnConfig.authenticatorAttachment2FA,
                createCustomToken: (uid) => auth.createCustomToken(uid),
                userID,
                userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
                webAuthnUserDocumentReference,
                webAuthnUserDocumentReferenceTarget
              }
            );
          case "verify reauthentication":
            return verifyReauthentication(
              {
                authenticationOptions: {
                  expectedOrigin: callableRequest.rawRequest.headers.origin || "",
                  expectedRPID: firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
                  requireUserVerification: (firebaseWebAuthnConfig.authenticatorAttachment2FA || firebaseWebAuthnConfig.authenticatorAttachment) === "platform" && firebaseWebAuthnConfig.userVerificationRequirement !== "discouraged",
                  response: callableRequest.data.authenticationResponse
                },
                authenticatorAttachment: firebaseWebAuthnConfig.authenticatorAttachment,
                authenticatorAttachment2FA: firebaseWebAuthnConfig.authenticatorAttachment2FA,
                createCustomToken: () => auth.createCustomToken(userID),
                userID,
                userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
                webAuthnUserDocumentReference
              }
            );
          case "verify registration":
            return verifyRegistration(
              {
                authenticatorAttachment: firebaseWebAuthnConfig.authenticatorAttachment,
                authenticatorAttachment2FA: firebaseWebAuthnConfig.authenticatorAttachment2FA,
                createCustomToken: () => auth.createCustomToken(userID),
                registrationOptions: {
                  expectedOrigin: callableRequest.rawRequest.headers.origin || "",
                  expectedRPID: firebaseWebAuthnConfig.relyingPartyID || callableRequest.rawRequest.headers.origin?.split("://")[1].split(":")[0] || "",
                  response: callableRequest.data.registrationResponse
                },
                userVerificationRequirement: firebaseWebAuthnConfig.userVerificationRequirement,
                webAuthnUserDocumentReference
              }
            );
        }
      } else
        return {
          code: "missing-auth",
          message: "No user is signed in.",
          operation: callableRequest.data.operation,
          success: false
        };
    }
  );
}

// libs/extension/src/lib/api.ts
var api = getFirebaseWebAuthnApi(
  {
    authenticatorAttachment: process.env["AUTHENTICATOR_ATTACHMENT"] === "any" ? void 0 : process.env["AUTHENTICATOR_ATTACHMENT"],
    authenticatorAttachment2FA: process.env["AUTHENTICATOR_ATTACHMENT_2FA"] === "any" ? void 0 : process.env["AUTHENTICATOR_ATTACHMENT_2FA"],
    relyingPartyName: process.env["RELYING_PARTY_NAME"],
    relyingPartyID: process.env["RELYING_PARTY_ID"],
    userVerificationRequirement: process.env["USER_VERIFICATION_REQUIREMENT"]
  }
);

// libs/extension/src/main.ts
if (getApps().length === 0)
  initializeApp();
export {
  api
};
