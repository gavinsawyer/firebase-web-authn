/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { isPlatformBrowser }                                                                                            from "@angular/common";
import { inject, Injectable, PLATFORM_ID, signal, type Signal }                                                         from "@angular/core";
import { toSignal }                                                                                                     from "@angular/core/rxjs-interop";
import { Auth, onIdTokenChanged, signInAnonymously, type User, type UserCredential }                                    from "@angular/fire/auth";
import { Functions }                                                                                                    from "@angular/fire/functions";
import { MatSnackBar }                                                                                                  from "@angular/material/snack-bar";
import { createUserWithPasskey, type FirebaseWebAuthnError, linkWithPasskey, signInWithPasskey, verifyUserWithPasskey } from "dist/libs/browser";
import { Observable, type Observer, startWith, type TeardownLogic }                                                     from "rxjs";
import { type ProfileDocument }                                                                                         from "../../interfaces";
import { ProfileService }                                                                                               from "./ProfileService";


@Injectable(
  {
    providedIn: "root",
  },
)
export class AuthenticationService {

  private readonly auth: Auth                     = inject<Auth>(Auth);
  private readonly functions: Functions           = inject<Functions>(Functions);
  private readonly matSnackBar: MatSnackBar       = inject<MatSnackBar>(MatSnackBar);
  private readonly profileService: ProfileService = inject<ProfileService>(ProfileService);

  public readonly user$: Signal<User | null>                             = isPlatformBrowser(inject<object>(PLATFORM_ID)) ? toSignal<User | null>(
    new Observable<User | null>(
      (userObserver: Observer<User | null>): TeardownLogic => onIdTokenChanged(
        this.auth,
        async (user: User | null): Promise<void> => user === null ? signInAnonymously(
          this.auth,
        ).then<void>(
          (userCredential: UserCredential): void => userObserver.next(
            userCredential.user,
          ),
        ) : userObserver.next(user),
      ),
    ).pipe<User | null>(
      startWith<User | null, [ User | null ]>(this.auth.currentUser),
    ),
    {
      requireSync: true,
    },
  ) : signal<User | null>(null);
  public readonly createUserWithPasskey: (name: string) => Promise<void> = (name: string): Promise<void> => createUserWithPasskey(
    this.auth,
    this.functions,
    name,
  ).then<void, never>(
    (): void => this.matSnackBar.open(
      "Sign-up successful.",
      "Okay",
    ) && void (0),
    (firebaseWebAuthnError: FirebaseWebAuthnError): never => {
      this.matSnackBar.open(
        firebaseWebAuthnError.message,
        "Okay",
      );

      throw firebaseWebAuthnError;
    },
  );
  public readonly linkBackupPasskey: () => Promise<void>                 = (): Promise<void> => (async (profileDocument: ProfileDocument | null): Promise<void> => profileDocument ? linkWithPasskey(
    this.auth,
    this.functions,
    profileDocument.name + " (Backup)",
    "second",
  ).then<void, never>(
    (): void => this.matSnackBar.open(
      "Backup passkey link successful.",
      "Okay",
    ) && void (0),
    (firebaseWebAuthnError: FirebaseWebAuthnError): never => {
      this.matSnackBar.open(
        firebaseWebAuthnError.code === "firebaseWebAuthn/no-op" ? "You already have a backup passkey." : firebaseWebAuthnError.message || "Something went wrong.",
        "Okay",
      );

      throw firebaseWebAuthnError;
    },
  ) : void (0))(this.profileService.profileDocument$());
  public readonly signInAnonymously: () => Promise<void>                 = (): Promise<void> => signInAnonymously(this.auth).then<void, never>(
    (): void => void (0),
    (error: unknown): never => {
      this.matSnackBar.open(
        "Something went wrong.",
        "Okay",
      );

      throw error;
    },
  );
  public readonly signInWithPasskey: () => Promise<void>                 = (): Promise<void> => signInWithPasskey(
    this.auth,
    this.functions,
  ).then<void, never>(
    (): void => this.matSnackBar.open(
      "Sign-in successful.",
      "Okay",
    ) && void (0),
    (firebaseWebAuthnError: FirebaseWebAuthnError): never => {
      this.matSnackBar.open(
        firebaseWebAuthnError.code === "firebaseWebAuthn/no-op" ? "You're already signed in as this user." : firebaseWebAuthnError.message || "Something went wrong.",
        "Okay",
      );

      throw firebaseWebAuthnError;
    },
  );
  public readonly verifyUserWithPasskey: () => Promise<void>             = (): Promise<void> => verifyUserWithPasskey(
    this.auth,
    this.functions,
  ).then<void, never>(
    (): void => this.matSnackBar.open(
      "Verification successful.",
      "Okay",
    ) && void (0),
    (firebaseWebAuthnError: FirebaseWebAuthnError): never => {
      this.matSnackBar.open(
        firebaseWebAuthnError.message || "Something went wrong.",
        "Okay",
      );

      throw firebaseWebAuthnError;
    },
  );

}
