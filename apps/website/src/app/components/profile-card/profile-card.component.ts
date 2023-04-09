import { CommonModule }                                                    from "@angular/common";
import { Component }                                                       from "@angular/core";
import { Auth, signInAnonymously }                                         from "@angular/fire/auth";
import { Functions }                                                       from "@angular/fire/functions";
import { MatButtonModule }                                                 from "@angular/material/button";
import { MatCardModule }                                                   from "@angular/material/card";
import { MatSnackBar, MatSnackBarModule }                                  from "@angular/material/snack-bar";
import { FirebaseWebAuthnError, signInWithPasskey, verifyUserWithPasskey } from "@firebase-web-authn/browser";
import { ProfileService }                                                  from "../../services";


@Component({
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  selector: "website-app-profile-card",
  standalone: true,
  styleUrls: [
    "./profile-card.component.sass",
  ],
  templateUrl: "./profile-card.component.html",
})
export class ProfileCardComponent {

  constructor(
    private readonly auth: Auth,
    private readonly functions: Functions,
    private readonly matSnackBar: MatSnackBar,

    public readonly profileService: ProfileService,
  ) {
    this
      .verifyUserWithPasskey = (): Promise<void> => verifyUserWithPasskey(auth, functions)
      .then<void>((): void => matSnackBar.open("Verification successful.", "Okay") && void(0))
      .catch<never>((firebaseWebAuthnError: FirebaseWebAuthnError): never => matSnackBar.open(firebaseWebAuthnError.message || "Something went wrong.", "Okay") && ((): never => {
        throw firebaseWebAuthnError;
      })());
    this
      .signInAnonymously = (): Promise<void> => signInAnonymously(auth)
      .then<void>((): void => void(0));
    this
      .signInWithPasskey = (): Promise<void> => signInWithPasskey(auth, functions)
      .then<void>((): void => matSnackBar.open("Sign-in successful.", "Okay") && void(0))
      .catch<never>((firebaseWebAuthnError: FirebaseWebAuthnError): never => matSnackBar.open(firebaseWebAuthnError.message || "Something went wrong.", "Okay") && ((): never => {
        throw firebaseWebAuthnError;
      })());
  }

  public readonly verifyUserWithPasskey: () => Promise<void>;
  public readonly signInAnonymously: () => Promise<void>;
  public readonly signInWithPasskey: () => Promise<void>;

}
