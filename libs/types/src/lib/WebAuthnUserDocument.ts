import { Timestamp }                    from "firebase-admin/firestore";
import { WebAuthnProcess }              from "./WebAuthnProcess";
import { WebAuthnUserCredential }       from "./WebAuthnUserCredential";
import { WebAuthnUserCredentialFactor } from "./WebAuthnUserCredentialFactor";


/**
 * Document in the `users` collection of the `ext-firebase-web-authn` Firestore Database. This should not have read or write access from users.
 */
export interface WebAuthnUserDocument {
  /**
   * Only present between operations and cleaned up if the user cancels.
   */
  "challenge"?: {
    "process": WebAuthnProcess
    "processingCredential"?: WebAuthnUserCredentialFactor
    "value": string
  }
  /**
   * Information about the primary public key credential associated with the user.
   */
  "credentials"?: {
    "first": WebAuthnUserCredential
    "second"?: WebAuthnUserCredential
  }
  /**
   * The last type of credential successfully used.
   */
  "lastCredentialUsed"?: WebAuthnUserCredentialFactor
  /**
   * A {@link Timestamp} automatically updated on successful operations.
   */
  "lastPresent"?: Timestamp
  /**
   * A {@link Timestamp} automatically updated on successful operations that verified the user with biometrics.
   */
  "lastVerified"?: Timestamp
  /**
   * The last WebAuthn process successfully completed by the user.
   */
  "lastWebAuthnProcess": WebAuthnProcess
}
