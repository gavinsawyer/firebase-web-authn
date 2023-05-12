"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions_1 = require("@firebase-web-authn/functions");
exports.api = (0, functions_1.getFirebaseWebAuthnApi)({
    authenticatorAttachment: process.env["AUTHENTICATOR_ATTACHMENT"],
    relyingPartyName: process.env["RELYING_PARTY_NAME"],
    userVerificationRequirement: process.env["USER_VERIFICATION_REQUIREMENT"],
});
//# sourceMappingURL=api.js.map