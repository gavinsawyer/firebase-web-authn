/**
 * @property authenticatorAttachment - Your app's preferred authenticator attachment modality. "cross-platform" allows security keys. "platform" allows passkey managers in the user's cloud or browser.
 * @property relyingPartyName - Your app's display name in the passkey popup on some platforms.
 * @property userVerificationRequirement - Your app's user verification requirement. "preferred" is default.
 *
 * @see {@link https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html User Presence vs User Verification}}
 */
export interface FirebaseWebAuthnConfig {
  authenticatorAttachment: AuthenticatorAttachment,
  relyingPartyName: string,
  userVerificationRequirement?: UserVerificationRequirement,
}
