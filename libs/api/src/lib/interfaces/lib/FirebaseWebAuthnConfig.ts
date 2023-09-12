/**
 * Configuration for your WebAuthn Cloud Function
 *
 * @see {@link https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html | User Presence vs User Verification}
 */
export interface FirebaseWebAuthnConfig {
  /**
   * Preferred {@link https://www.w3.org/TR/webauthn-2/#enum-attachment authenticator attachment} modality. "cross-platform" allows security keys. "platform" allows passkey managers. Not specifying a value allows either attachment.
   */
  "authenticatorAttachment"?: AuthenticatorAttachment,
  /**
   * Preferred {@link https://www.w3.org/TR/webauthn-2/#enum-attachment authenticator attachment} modality for backup passkeys. This can be set differently to support offline-only backup passkeys, for example. Not specifying a value allows either attachment.
   */
  "backupAuthenticatorAttachment"?: AuthenticatorAttachment,
  /**
   * Your app's display name in the passkey popup on some browsers.
   */
  "relyingPartyName": string,
  /**
   * Your app's {@link https://www.w3.org/TR/webauthn/#enumdef-userverificationrequirement | user verification requirement}. "required" only works with "platform" authenticator attachment. "preferred" is default.
   */
  "userVerificationRequirement"?: UserVerificationRequirement,
}
