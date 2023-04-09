import { HttpsFunction }       from "firebase-functions";
import { getFirebaseWebAuthn } from "../../../functions/src";


export const firebaseWebAuthn: HttpsFunction = getFirebaseWebAuthn({
  authenticatorAttachment: "platform",
  relyingPartyName: "FirebaseWebAuthn",
  userVerificationRequirement: "required",
});
