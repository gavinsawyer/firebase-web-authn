import { getFirebaseWebAuthnApi }                               from "@firebase-web-authn/api";
import { FunctionRequest, FunctionResponse }                    from "@firebase-web-authn/types";
import { AuthenticatorAttachment, UserVerificationRequirement } from "@simplewebauthn/types";
import { CallableFunction }                                     from "firebase-functions/v2/https";


export const api: CallableFunction<FunctionRequest, Promise<FunctionResponse>> = getFirebaseWebAuthnApi(
  {
    authenticatorAttachment:     process.env["AUTHENTICATOR_ATTACHMENT"] as AuthenticatorAttachment | "any" === "any" ? undefined : (process.env["AUTHENTICATOR_ATTACHMENT"] as AuthenticatorAttachment),
    authenticatorAttachment2FA:  process.env["AUTHENTICATOR_ATTACHMENT_2FA"] as AuthenticatorAttachment | "any" === "any" ? undefined : (process.env["AUTHENTICATOR_ATTACHMENT_2FA"] as AuthenticatorAttachment),
    relyingPartyName:            process.env["RELYING_PARTY_NAME"] as string,
    relyingPartyID:              process.env["RELYING_PARTY_ID"] as string,
    userVerificationRequirement: process.env["USER_VERIFICATION_REQUIREMENT"] as UserVerificationRequirement,
  },
);
