import { Timestamp }              from "firebase-admin/firestore";
import { WebAuthnUserCredential } from "./web-authn-user-credential";


/**
 * Document in the `webAuthnUsers` collection. This should not have read or write access from users.
 *
 * @property challenge - Only present between operations and cleaned up if the user cancels.
 * @property credential - Information about the public key credential associated with the user.
 * @property lastPresent - Automatically updated on successful operations.
 * @property lastVerified - Automatically updated on successful operations that verified the user with biometrics.
 */
export interface WebAuthnUserDocument {
  "challenge"?: string,
  "credential"?: WebAuthnUserCredential,
  "lastPresent"?: Timestamp,
  "lastVerified"?: Timestamp,
}
