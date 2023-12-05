/**
 * Configuration for your WebAuthn Cloud Function
 */
export interface FirebaseWebAuthnConfig {
  /**
   * Optional {@link https://www.w3.org/TR/webauthn-2/#enum-attachment authenticator attachment}. `"cross-platform"` allows security keys. `"platform"` allows passkey managers.
   *
   * Default behavior allows either authenticator attachment.
   *
   * @default
   *  undefined
   */
  "authenticatorAttachment"?: AuthenticatorAttachment
  /**
   * Optional {@link https://www.w3.org/TR/webauthn-2/#enum-attachment authenticator attachment} for second (2FA) factor passkeys.
   *
   * Default behavior follows {@link FirebaseWebAuthnConfig.authenticatorAttachment authenticator attachment configuration}, but can be set differently to support offline-only backup passkeys for example.
   *
   * @default
   *  undefined
   */
  "authenticatorAttachment2FA"?: AuthenticatorAttachment
  /**
   * Your app's display name in the passkey popup on some browsers.
   */
  "relyingPartyName": string
  /**
   * Optional {@link https://www.w3.org/TR/webauthn/#enumdef-userverificationrequirement user verification requirement}.
   *
   * - The `"required"` setting only works with `"platform"` {@link FirebaseWebAuthnConfig.authenticatorAttachment authenticator attachment} since biometric verification isn't possible with security keys.
   * - If {@link FirebaseWebAuthnConfig.authenticatorAttachment2FA authenticator attachment for second (2FA) factor passkeys} is specified as `"cross-platform"`, this will only apply to first (1FA) factor passkeys.
   *
   * Default behavior follows `"preferred"`
   *
   * @default
   *  undefined
   *
   * @see
   *  {@link https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html User Presence vs User Verification}
   */
  "userVerificationRequirement"?: UserVerificationRequirement
}
