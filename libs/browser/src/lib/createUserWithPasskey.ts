import { Auth, signInAnonymously, UserCredential } from "firebase/auth";
import { Functions }                               from "firebase/functions";
import { FirebaseWebAuthnError }                   from "./FirebaseWebAuthnError";
import { linkWithPasskey }                         from "./linkWithPasskey";


/**
 * Asynchronously creates and signs in a user with a passkey. If there is already an anonymous user signed in, that user will be returned.
 *
 * @param auth - The {@link Auth} instance.
 * @param functions - The {@link Functions} instance.
 * @param name - An existing user identifier if FirebaseWebAuthn is configured as an MFA provider, or any recognizable value if FirebaseWebAuthn is your sole auth provider. With generic values consider passing something like "${firstName} | Personal" for users who share a passkey manager with others.
 *
 * @returns
 *  A {@link UserCredential} when successful.
 * @throws
 *  {@link FirebaseWebAuthnError}
 */
export const createUserWithPasskey: (auth: Auth, functions: Functions, name: string) => Promise<UserCredential> = (auth: Auth, functions: Functions, name: string): Promise<UserCredential> => auth
  .currentUser && auth
  .currentUser
  .isAnonymous ? linkWithPasskey(
    auth,
    functions,
    name,
  ) : signInAnonymously(auth)
  .then<UserCredential, never>(
    (): Promise<UserCredential> => linkWithPasskey(
      auth,
      functions,
      name,
    ),
    (firebaseError): never => {
      throw new FirebaseWebAuthnError(
        {
          code:    firebaseError.code.replace(
            "firebaseWebAuthn/",
            "",
          ),
          message: firebaseError.message,
          method:  "signInAnonymously",
        },
      );
    },
  );
