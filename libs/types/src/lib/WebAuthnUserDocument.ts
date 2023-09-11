import { Timestamp }              from "firebase-admin/firestore";
import { WebAuthnUserCredential } from "./WebAuthnUserCredential";


/**
 * Document in the `users` collection of the `ext-firebase-web-authn` Firestore Database. This should not have read or write access from users.
 */
export interface WebAuthnUserDocument {
  /**
   * Only present between operations and cleaned up if the user cancels.
   */
  "challenge"?: {
    "process": "authentication" | "reauthentication" | "registration",
    "processingCredentialType": WebAuthnUserCredential["type"],
    "value": string,
  },
  /**
   * Information about the primary public key credential associated with the user.
   */
  "credential"?: WebAuthnUserCredential,
  /**
   * Information about the backup public key credential associated with the user.
   */
  "backupCredential"?: WebAuthnUserCredential,
  /**
   * The last type of credential successfully used.
   */
  "lastCredentialUsed"?: WebAuthnUserCredential["type"],
  /**
   * A {@link Timestamp} automatically updated on successful operations.
   */
  "lastPresent"?: Timestamp,
  /**
   * A {@link Timestamp} automatically updated on successful operations that verified the user with biometrics.
   */
  "lastVerified"?: Timestamp,
}
