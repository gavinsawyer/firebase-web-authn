import { HttpsFunction }       from "firebase-functions";
import { getFirebaseWebAuthn } from "@firebase-web-authn/functions";


export const firebaseWebAuthn: HttpsFunction = getFirebaseWebAuthn({
  authenticatorAttachment: "platform",
  relyingPartyName: "FirebaseWebAuthn Demo",
  userVerificationRequirement: "required",
});
