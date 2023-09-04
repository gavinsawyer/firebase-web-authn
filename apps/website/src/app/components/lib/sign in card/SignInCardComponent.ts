import { NgIf }                                                    from "@angular/common";
import { Component, inject }                                       from "@angular/core";
import { Auth, User }                                              from "@angular/fire/auth";
import { doc, DocumentReference, Firestore, setDoc }               from "@angular/fire/firestore";
import { Functions }                                               from "@angular/fire/functions";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule }                                         from "@angular/material/button";
import { MatCardModule }                                           from "@angular/material/card";
import { MatFormFieldModule }                                      from "@angular/material/form-field";
import { MatIconModule }                                           from "@angular/material/icon";
import { MatInputModule }                                          from "@angular/material/input";
import { MatSnackBar, MatSnackBarModule }                          from "@angular/material/snack-bar";
import { createUserWithPasskey, FirebaseWebAuthnError }            from "@firebase-web-authn/browser";
import { ProfileDocument }                                         from "../../../interfaces";
import { AuthenticationService }                                   from "../../../services";


@Component({
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    NgIf,
    ReactiveFormsModule,
  ],
  selector:    "website-sign-in-card",
  standalone:  true,
  styleUrls:   [
    "./SignInCardComponent.sass",
  ],
  templateUrl: "./SignInCardComponent.html",
})
export class SignInCardComponent {

  private readonly auth:        Auth        = inject<Auth>(Auth);
  private readonly firestore:   Firestore   = inject<Firestore>(Firestore);
  private readonly functions:   Functions   = inject<Functions>(Functions);
  private readonly matSnackBar: MatSnackBar = inject<MatSnackBar>(MatSnackBar);

  public readonly authenticationService: AuthenticationService                      = inject<AuthenticationService>(AuthenticationService);
  public readonly formGroup:             FormGroup<{ "name": FormControl<string> }> = new FormGroup<{ "name": FormControl<string> }>(
    {
      name: new FormControl(
        "",
        {
          nonNullable: true,
          validators: Validators.required,
        },
      ),
    },
  );
  public readonly submit:                () => Promise<void>                        = async (): Promise<void> => this
    .formGroup
    .value
    .name ? (async (name: string | undefined, user: User | null): Promise<void> => name && user ? ((): Promise<void> => {
      this
        .formGroup
        .disable();

      return createUserWithPasskey(
        this.auth,
        this.functions,
        name,
      )
        .then<void, never>(
          (): Promise<void> => this.matSnackBar.open(
            "Sign-up successful.",
            "Okay",
          ) && setDoc(
            doc(
              this.firestore,
              "/profiles/" + user.uid,
            ) as DocumentReference<ProfileDocument>,
            {
              name: this.formGroup.value.name,
            },
          ),
          (firebaseWebAuthnError: FirebaseWebAuthnError): never => this.matSnackBar.open(
            firebaseWebAuthnError.message,
            "Okay",
          ) && ((): never => {
            this
              .formGroup
              .enable();

            throw firebaseWebAuthnError;
          })(),
        );
    })() : void (0))(
      this.formGroup.value.name,
      this.authenticationService.user$(),
    ) : void (0);

}
