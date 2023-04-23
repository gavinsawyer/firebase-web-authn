import { CredentialDeviceType } from "@simplewebauthn/typescript-types";
import { Timestamp }            from "firebase-admin/firestore";


export interface WebAuthnUserDocument {
  "challenge"?: string,
  "credential"?: {
    "backedUp": boolean,
    "counter": number,
    "deviceType": CredentialDeviceType,
    "id": Uint8Array,
    "publicKey": Uint8Array,
  },
  "lastPresent"?: Timestamp,
  "lastVerified"?: Timestamp,
}
