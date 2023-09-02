import { CommonModule }                                                    from "@angular/common";
import { Component }                                                       from "@angular/core";
import { Auth, onAuthStateChanged, signInAnonymously }                     from "@angular/fire/auth";
import { Functions }                                                       from "@angular/fire/functions";
import { MatButtonModule }                                                 from "@angular/material/button";
import { MatCardModule }                                                   from "@angular/material/card";
import { MatSnackBar, MatSnackBarModule }                                  from "@angular/material/snack-bar";
import { FirebaseWebAuthnError, signInWithPasskey, verifyUserWithPasskey } from "@firebase-web-authn/browser";
import { firstValueFrom, Observable, Observer, TeardownLogic }             from "rxjs";
import { ProfileService }                                                  from "../../../services";


@Component({
  imports:     [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  selector:    "website-profile-card",
  standalone:  true,
  styleUrls:   [
    "./ProfileCardComponent.sass",
  ],
  templateUrl: "./ProfileCardComponent.html",
})
export class ProfileCardComponent {

  public readonly verifyUserWithPasskey: () => Promise<void>;
  public readonly signInAnonymously:     () => Promise<void>;
  public readonly signInWithPasskey:     () => Promise<void>;

  constructor(
    private readonly auth:        Auth,
    private readonly functions:   Functions,
    private readonly matSnackBar: MatSnackBar,

    public readonly profileService: ProfileService,
  ) {
    this
      .verifyUserWithPasskey = (): Promise<void> => verifyUserWithPasskey(
        {
          ...this.auth,
          authStateReady: async (): Promise<void> => firstValueFrom<void>(new Observable<void>(
            (userObserver: Observer<void>): TeardownLogic => onAuthStateChanged(
              this.auth,
              (): void => userObserver.next(),
            ),
          )),
        },
        this.functions,
      )
      .then<void>(
        (): void => this.matSnackBar.open(
          "Verification successful.",
          "Okay",
        ) && void (0),
      )
      .catch<never>(
        (firebaseWebAuthnError: FirebaseWebAuthnError): never => this.matSnackBar.open(
          firebaseWebAuthnError.message || "Something went wrong.",
          "Okay",
        ) && ((): never => {
          throw firebaseWebAuthnError;
        })(),
      );
    this
      .signInAnonymously = (): Promise<void> => signInAnonymously(this.auth)
      .then<void>(
        (): void => void (0),
      );
    this
      .signInWithPasskey = (): Promise<void> => signInWithPasskey(
        {
          ...this.auth,
          authStateReady: async (): Promise<void> => firstValueFrom<void>(new Observable<void>(
            (userObserver: Observer<void>): TeardownLogic => onAuthStateChanged(
              this.auth,
              (): void => userObserver.next(),
            ),
          )),
        },
        this.functions,
      )
      .then<void>(
        (): void => this.matSnackBar.open(
          "Sign-in successful.",
          "Okay",
        ) && void (0),
      )
      .catch<never>(
        (firebaseWebAuthnError: FirebaseWebAuthnError): never => this.matSnackBar.open(
          firebaseWebAuthnError.message || "Something went wrong.",
          "Okay",
        ) && ((): never => {
          throw firebaseWebAuthnError;
        })(),
      );
  }

}