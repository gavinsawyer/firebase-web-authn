/**
 * Configuration for your WebAuthn Cloud Function
 */
export interface FirebaseWebAuthnConfig {
  /**
   * Optional {@link https://www.w3.org/TR/webauthn-2/#enum-attachment authenticator attachment} for primary passkeys. `"cross-platform"` only allows physical security keys. `"platform"` only allows passkey managers.
   *
   * Default behavior is `"any"` which allows either.
   *
   * @default
   *  undefined
   */
  "authenticatorAttachment"?: AuthenticatorAttachment;
  /**
   * Optional {@link https://www.w3.org/TR/webauthn-2/#enum-attachment authenticator attachment} for secondary passkeys.
   *
   * Default behavior is `"cross-platform"` which only allows physical security keys to be used for 2FA. This should differ from the previous setting as it is intended to be a fail-safe.
   *
   * @default
   *  undefined
   */
  "authenticatorAttachment2FA"?: AuthenticatorAttachment;
  /**
   * Optional Relying Party ID.
   *
   * For use...
   * - in mobile apps without a domain (provide any domain you control in order to avoid phishing from fraudulent web-based logins), or
   * - to increase passkeys' scope when hosting the app on a subdomain (provide the highest level of domain you control).
   *
   * Default behavior uses the hostname of origin, i.e. `login.example.com` when the origin is `https://login.example.com:3000`.
   *
   * @default
   *  undefined
   *
   */
  "relyingPartyID"?: string;
  /**
   * The relying party name appears in the passkey window in some browsers in place of your domain name.
   */
  "relyingPartyName": string;
  /**
   * Optional {@link https://www.w3.org/TR/webauthn/#enumdef-userverificationrequirement user verification requirement}.
   *
   * - `"preferred"` requests user verification when possible.
   * - `"discouraged"` requests skipping user verification to speed up the interaction.
   * - `"required"` requests user verification and fails if it is not provided, but does not apply with {@link FirebaseWebAuthnConfig.authenticatorAttachment authenticator attachment} set to `"cross-platform"` since user verification isn't possible with physical security keys. If {@link FirebaseWebAuthnConfig.authenticatorAttachment2FA authenticator attachment for secondary passkeys (2FA)} is set to `"cross-platform"`, `"required"` will not apply to secondary passkeys.
   *
   * Default behavior is `"preferred"`.
   *
   * @default
   *  undefined
   *
   * @see
   *  {@link https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/User_Presence_vs_User_Verification.html User Presence vs User Verification}
   */
  "userVerificationRequirement"?: UserVerificationRequirement;
}
