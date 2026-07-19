// noinspection JSUnusedGlobalSymbols

/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { getFirebaseWebAuthnApi }                                         from "@firebase-web-authn/api";
import { type FunctionRequest, type FunctionResponse }                    from "@firebase-web-authn/types";
import { type AuthenticatorAttachment, type UserVerificationRequirement } from "@simplewebauthn/server";
import { type CallableFunction }                                          from "firebase-functions/https";


export const api: CallableFunction<FunctionRequest, Promise<FunctionResponse>> = getFirebaseWebAuthnApi(
  {
    authenticatorAttachment:     process.env["AUTHENTICATOR_ATTACHMENT"] as AuthenticatorAttachment | "any" === "any" ? undefined : (process.env["AUTHENTICATOR_ATTACHMENT"] as AuthenticatorAttachment),
    authenticatorAttachment2FA:  process.env["AUTHENTICATOR_ATTACHMENT_2FA"] as AuthenticatorAttachment | "any" === "any" ? undefined : (process.env["AUTHENTICATOR_ATTACHMENT_2FA"] as AuthenticatorAttachment),
    relyingPartyName:            process.env["RELYING_PARTY_NAME"] as string,
    relyingPartyID:              process.env["RELYING_PARTY_ID"] as string,
    userVerificationRequirement: process.env["USER_VERIFICATION_REQUIREMENT"] as UserVerificationRequirement,
  },
);
