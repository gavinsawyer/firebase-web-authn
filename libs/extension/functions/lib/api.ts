import { getFirebaseWebAuthnApi }                               from "@firebase-web-authn/functions";
import { AuthenticatorAttachment, UserVerificationRequirement } from "@simplewebauthn/typescript-types";
import { HttpsFunction }                                        from "firebase-functions";


export const api: HttpsFunction = getFirebaseWebAuthnApi({
  authenticatorAttachment: process.env["USER_VERIFICATION_REQUIREMENT"] as AuthenticatorAttachment,
  relyingPartyName: process.env["RELYING_PARTY_NAME"] as string,
  userVerificationRequirement: process.env["USER_VERIFICATION_REQUIREMENT"] as UserVerificationRequirement,
});
