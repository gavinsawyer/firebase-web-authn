import { Timestamp }              from "firebase-admin/firestore";
import { WebAuthnUserCredential } from "./WebAuthnUserCredential";


/**
 * Document in the `webAuthnUsers` collection. This should not have read or write access from users.
 */
export interface WebAuthnUserDocument {
  /**
   * Only present between operations and cleaned up if the user cancels.
   */
  "challenge"?: string,
  /**
   * Information about the public key credential associated with the user.
   */
  "credential"?: WebAuthnUserCredential,
  /**
   * Automatically updated on successful operations.
   */
  "lastPresent"?: Timestamp,
  /**
   * Automatically updated on successful operations that verified the user with biometrics.
   */
  "lastVerified"?: Timestamp,
}
