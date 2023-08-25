import { getFirebaseWebAuthnApi } from "@firebase-web-authn/api";
export const api = getFirebaseWebAuthnApi({
    authenticatorAttachment: process.env["AUTHENTICATOR_ATTACHMENT"],
    relyingPartyName: process.env["RELYING_PARTY_NAME"],
    userVerificationRequirement: process.env["USER_VERIFICATION_REQUIREMENT"],
});
//# sourceMappingURL=api.js.map