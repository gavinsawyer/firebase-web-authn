/**
 * Information about the public key credential associated with the user
 */
export interface WebAuthnUserCredential {
  /**
   * Whether the private key is eligible to be backed up.
   */
  "backupEligible": boolean
  /**
   * Whether the private key has been backed up successfully.
   */
  "backupSuccessful": boolean,
  /**
   * Updated automatically by some browsers to help prevent replay attacks.
   */
  "counter": number,
  /**
   * ID associated with the credential.
   */
  "id": Uint8Array,
  /**
   * Public key associated with the credential.
   */
  "publicKey": Uint8Array,
}
