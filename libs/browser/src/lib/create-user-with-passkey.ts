import { Auth, signInAnonymously, signInWithCustomToken, UserCredential } from "firebase/auth";
import { Functions }                                                      from "firebase/functions";
import { FirebaseWebAuthnError }                                          from "./firebase-web-authn-error";
import { linkWithPasskey }                                                from "./link-with-passkey";


/**
 * Asynchronously creates and signs in a user with a passkey, relying on {@link signInAnonymously} to start the process and {@link signInWithCustomToken} to complete the process. If there is already an anonymous user signed in, that user will be returned.
 *
 * @param auth - The {@link Auth} instance.
 * @param functions - The {@link Functions} instance.
 * @param name - An existing user identifier if FirebaseWebAuthn is configured as an MFA provider, or any recognizable value if FirebaseWebAuthn is your sole auth provider. With generic values consider passing something like "${firstName} | Personal" for users who share a passkey manager with others.
 *
 * @returns {@link UserCredential} when successful.
 * @throws {@link FirebaseWebAuthnError}
 */
export const createUserWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential> = (auth: Auth, functions: Functions, name: string): Promise<UserCredential> => auth
  .currentUser && auth
  .currentUser
  .isAnonymous ? linkWithPasskey(auth, functions, name) : signInAnonymously(auth)
  .then<UserCredential>((): Promise<UserCredential> => linkWithPasskey(auth, functions, name))
  .catch<never>((firebaseError): never => {
    throw new FirebaseWebAuthnError({
      code: firebaseError.code,
      message: firebaseError.message,
      method: "signInAnonymously",
    });
  });
