/**
 * Information about the public key credential associated with the user
 *
 * @property backupEligible - Whether the private key is eligible to be backed up.
 * @property backupSuccessful - Whether the private key has been backed up successfully.
 * @property counter - Updated automatically by some browsers to help prevent replay attacks.
 * @property id - ID associated with the credential.
 * @property publicKey - Public key associated with the credential.
 */
export interface WebAuthnUserCredential {
  "backupEligible": boolean,
  "backupSuccessful": boolean,
  "counter": number,
  "id": Uint8Array,
  "publicKey": Uint8Array,
}
