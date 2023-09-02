import { getFirebaseWebAuthnApi }                               from "@firebase-web-authn/api";
import { AuthenticatorAttachment, UserVerificationRequirement } from "@simplewebauthn/typescript-types";
import { HttpsFunction }                                        from "firebase-functions";


// noinspection JSUnusedGlobalSymbols
export const api: HttpsFunction = getFirebaseWebAuthnApi(
  {
    authenticatorAttachment:     process.env["AUTHENTICATOR_ATTACHMENT"] as AuthenticatorAttachment,
    relyingPartyName:            process.env["RELYING_PARTY_NAME"] as string,
    userVerificationRequirement: process.env["USER_VERIFICATION_REQUIREMENT"] as UserVerificationRequirement,
  },
);
