import { getFirebaseWebAuthnApi }                               from "@firebase-web-authn/api";
import { FunctionRequest, FunctionResponse }                    from "@firebase-web-authn/types";
import { AuthenticatorAttachment, UserVerificationRequirement } from "@simplewebauthn/typescript-types";
import { CallableFunction }                                     from "firebase-functions/v2/https";


export const api: CallableFunction<FunctionRequest, Promise<FunctionResponse>> = getFirebaseWebAuthnApi(
  {
    authenticatorAttachment:     process.env["AUTHENTICATOR_ATTACHMENT"] as AuthenticatorAttachment,
    relyingPartyName:            process.env["RELYING_PARTY_NAME"] as string,
    userVerificationRequirement: process.env["USER_VERIFICATION_REQUIREMENT"] as UserVerificationRequirement,
  },
);
