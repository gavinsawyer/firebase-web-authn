import { NgIf }                                                    from "@angular/common";
import { Component, inject, signal, WritableSignal }               from "@angular/core";
import { User }                                                    from "@angular/fire/auth";
import { deleteDoc, doc, DocumentReference, Firestore, setDoc }    from "@angular/fire/firestore";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule }                                         from "@angular/material/button";
import { MatCardModule }                                           from "@angular/material/card";
import { MatFormFieldModule }                                      from "@angular/material/form-field";
import { MatIconModule }                                           from "@angular/material/icon";
import { MatInputModule }                                          from "@angular/material/input";
import { FirebaseWebAuthnError }                                   from "dist/libs/browser";
import { ProfileDocument }                                         from "../../../interfaces";
import { AuthenticationService, EllipsesService }                  from "../../../services";


@Component({
  imports:     [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    NgIf,
    ReactiveFormsModule,
  ],
  selector:    "website-signed-out",
  standalone:  true,
  styleUrls:   [
    "./SignedOutComponent.sass",
  ],
  templateUrl: "./SignedOutComponent.html",
})
export class SignedOutComponent {

  private readonly authenticationService: AuthenticationService = inject<AuthenticationService>(AuthenticationService);
  private readonly firestore:             Firestore             = inject<Firestore>(Firestore);

  public readonly ellipsesService:   EllipsesService                            = inject<EllipsesService>(EllipsesService);
  public readonly signInWithPasskey: () => Promise<void>                        = (): Promise<void> => {
    this
      .signInWorking$
      .set(true);
    this
      .signUpFormGroup
      .disable();

    return this
      .authenticationService
      .signInWithPasskey()
      .catch<never>(
        (firebaseWebAuthnError: FirebaseWebAuthnError): never => {
          this
            .signUpFormGroup
            .enable();

          throw firebaseWebAuthnError;
        },
      )
      .finally(
        (): void => this.signInWorking$.set(false),
      )
  };
  public readonly signInWorking$:    WritableSignal<boolean>                    = signal<boolean>(false);
  public readonly signUpFormGroup:   FormGroup<{ "name": FormControl<string> }> = new FormGroup<{ "name": FormControl<string> }>(
    {
      name: new FormControl(
        "",
        {
          nonNullable: true,
          validators:  Validators.required,
        },
      ),
    },
  );
  public readonly signUpSubmit:      () => Promise<void>                        = async (): Promise<void> => this
    .signUpFormGroup
    .value
    .name ? (async (name: string | undefined, user: User | null): Promise<void> => name && user ? ((): Promise<void> => {
      this
        .signUpWorking$
        .set(true);
      this
        .signUpFormGroup
        .disable();

      return ((profileDocumentReference: DocumentReference<ProfileDocument>): Promise<void> => setDoc(
        profileDocumentReference,
        {
          name: name,
        },
      ).then<void>(
        (): Promise<void> => this.authenticationService.createUserWithPasskey(
          name,
        ),
      ).catch<never>(
        (firebaseWebAuthnError: FirebaseWebAuthnError): never => {
          deleteDoc(profileDocumentReference);

          this
            .signUpFormGroup
            .enable();

          throw firebaseWebAuthnError;
        },
      ).finally(
        (): void => this.signUpWorking$.set(false),
      ))(
        doc(
          this.firestore,
          "/profiles/" + user.uid,
        ) as DocumentReference<ProfileDocument>,
      );
    })() : void (0))(
      this.signUpFormGroup.value.name,
      this.authenticationService.user$(),
    ) : void (0);
  public readonly signUpWorking$:    WritableSignal<boolean>                    = signal<boolean>(false);

}
