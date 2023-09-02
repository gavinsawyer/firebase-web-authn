/**
 * Configuration for your WebAuthn Cloud Function
 *
 * @see {@link https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html | User Presence vs User Verification}
 */
export interface FirebaseWebAuthnConfig {
  /**
   * Preferred {@link https://www.w3.org/TR/webauthn-2/#enum-attachment | authenticator attachment} modality. "cross-platform" allows security keys. "platform" allows passkey managers.
   */
  "authenticatorAttachment": AuthenticatorAttachment,
  /**
   * Your app's display name in the passkey popup on some browsers.
   */
  "relyingPartyName": string,
  /**
   * Your app's {@link https://www.w3.org/TR/webauthn/#enumdef-userverificationrequirement | user verification requirement}. "preferred" is default.
   */
  "userVerificationRequirement"?: UserVerificationRequirement,
}
