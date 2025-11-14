/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

/**
 * Information about the public key credential associated with the user
 */
export interface WebAuthnUserCredential {
  /**
   * The {@link AuthenticatorAttachment} associated with the credential.
   */
  "authenticatorAttachment": AuthenticatorAttachment;
  /**
   * Whether the credential has been backed up successfully.
   */
  "backedUp": boolean;
  /**
   * Updated automatically by some authenticators to help prevent replay attacks.
   */
  "counter": number;
  /**
   * ID associated with the credential.
   */
  "id": Uint8Array;
  /**
   * Public key associated with the credential.
   */
  "publicKey": Uint8Array;
}
