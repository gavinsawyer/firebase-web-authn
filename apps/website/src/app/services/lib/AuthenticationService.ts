import { isPlatformBrowser }                                                                      from "@angular/common";
import { inject, Injectable, PLATFORM_ID, signal, Signal }                                        from "@angular/core";
import { toSignal }                                                                               from "@angular/core/rxjs-interop";
import { Auth, onIdTokenChanged, signInAnonymously, User, UserCredential }                        from "@angular/fire/auth";
import { Functions }                                                                              from "@angular/fire/functions";
import { MatSnackBar }                                                                            from "@angular/material/snack-bar";
import { createUserWithPasskey, FirebaseWebAuthnError, signInWithPasskey, verifyUserWithPasskey } from "@firebase-web-authn/browser";
import { Observable, Observer, startWith, TeardownLogic }                                         from "rxjs";


@Injectable({
  providedIn: "root",
})
export class AuthenticationService {

  private readonly auth:        Auth        = inject<Auth>(Auth);
  private readonly functions:   Functions   = inject<Functions>(Functions);
  private readonly matSnackBar: MatSnackBar = inject<MatSnackBar>(MatSnackBar);

  public readonly user$:                 Signal<User | null>             = isPlatformBrowser(inject<object>(PLATFORM_ID)) ? toSignal<User | null>(
    new Observable<User | null>(
      (userObserver: Observer<User | null>): TeardownLogic => onIdTokenChanged(
        this.auth,
        async (user: User | null): Promise<void> => user === null ? signInAnonymously(this.auth).then<void>(
          (userCredential: UserCredential): void => userObserver.next(userCredential.user),
        ) : userObserver.next(user),
      ),
    ).pipe<User | null>(
      startWith<User | null, [ User | null ]>(this.auth.currentUser),
    ),
    {
      requireSync: true,
    },
  ) : signal<User | null>(null);
  public readonly createUserWithPasskey: (name: string) => Promise<void> = (name:string): Promise<void> => createUserWithPasskey(
    this.auth,
    this.functions,
    name,
  )
    .then<void, never>(
      (): void => this.matSnackBar.open(
        "Sign-up successful.",
        "Okay",
      ) && void (0),
      (firebaseWebAuthnError: FirebaseWebAuthnError): never => this.matSnackBar.open(
        firebaseWebAuthnError.message,
        "Okay",
      ) && ((): never => {
        throw firebaseWebAuthnError;
      })(),
    );
  public readonly signInAnonymously:     () => Promise<void>             = (): Promise<void> => signInAnonymously(this.auth)
    .then<void>(
      (): void => void (0),
    );
  public readonly signInWithPasskey:     () => Promise<void>             = (): Promise<void> => signInWithPasskey(
    this.auth,
    this.functions,
  )
    .then<void, never>(
      (): void => this.matSnackBar.open(
        "Sign-in successful.",
        "Okay",
      ) && void (0),
      (firebaseWebAuthnError: FirebaseWebAuthnError): never => this.matSnackBar.open(
        firebaseWebAuthnError.message || "Something went wrong.",
        "Okay",
      ) && ((): never => {
        throw firebaseWebAuthnError;
      })(),
    );
  public readonly verifyUserWithPasskey: () => Promise<void>             = (): Promise<void> => verifyUserWithPasskey(
    this.auth,
    this.functions,
  )
    .then<void, never>(
      (): void => this.matSnackBar.open(
        "Verification successful.",
        "Okay",
      ) && void (0),
      (firebaseWebAuthnError: FirebaseWebAuthnError): never => this.matSnackBar.open(
        firebaseWebAuthnError.message || "Something went wrong.",
        "Okay",
      ) && ((): never => {
        throw firebaseWebAuthnError;
      })(),
    );

}
