import { HttpsFunction }       from "firebase-functions";
import { getFirebaseWebAuthn } from "../../../functions/src";


export const firebaseWebAuthn: HttpsFunction = getFirebaseWebAuthn({
  relyingPartyName: "FirebaseWebAuthn Demo",
  userVerificationRequirement: "required",
});
