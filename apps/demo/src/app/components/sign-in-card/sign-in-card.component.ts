import { CommonModule }                                                    from "@angular/common";
import { Component }                                                       from "@angular/core";
import { Auth, User }                                                      from "@angular/fire/auth";
import { doc, DocumentReference, Firestore, setDoc }                       from "@angular/fire/firestore";
import { Functions }                                                       from "@angular/fire/functions";
import { FormControl, FormGroup, ReactiveFormsModule }                     from "@angular/forms";
import { MatButtonModule }                                                 from "@angular/material/button";
import { MatCardModule }                                                   from "@angular/material/card";
import { MatFormFieldModule }                                              from "@angular/material/form-field";
import { MatIconModule }                                                   from "@angular/material/icon";
import { MatInputModule }                                                  from "@angular/material/input";
import { MatSnackBar, MatSnackBarModule }                                  from "@angular/material/snack-bar";
import { createUserWithPasskey, FirebaseWebAuthnError, signInWithPasskey } from "@firebase-web-authn/browser";
import { BehaviorSubject, firstValueFrom, Observable }                     from "rxjs";
import { ProfileDocument }                                                 from "../../interfaces";
import { AuthenticationService }                                           from "../../services";


interface SignInForm {
  "name"?: FormControl<string>,
}

type SignInFormStatus = "unsent" | "pending" | "complete";

@Component({
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  selector: "demo-app-sign-in-card",
  standalone: true,
  styleUrls: [
    "./sign-in-card.component.sass",
  ],
  templateUrl: "./sign-in-card.component.html",
})
export class SignInCardComponent {

  constructor(
    private readonly auth: Auth,
    private readonly authenticationService: AuthenticationService,
    private readonly firestore: Firestore,
    private readonly functions: Functions,
    private readonly matSnackBar: MatSnackBar,
  ) {
    this
      .formGroup = new FormGroup<SignInForm>({
        name: new FormControl("", {
          nonNullable: true,
        }),
      });
    this
      .signInWithPasskey = (): Promise<void> => signInWithPasskey(auth, functions)
      .then<void>((): void => matSnackBar.open("Sign-in successful.", "Okay") && void(0))
      .catch<never>((firebaseWebAuthnError: FirebaseWebAuthnError): never => matSnackBar.open(firebaseWebAuthnError.message, "Okay") && ((): never => {
        throw firebaseWebAuthnError;
      })());
    this
      .statusSubject = new BehaviorSubject<SignInFormStatus>("unsent");
    this
      .statusObservable = this
      .statusSubject
      .asObservable();
    this
      .submit = async (): Promise<void> => this
      .formGroup
      .value
      .name ? ((name: string): Promise<void> => firstValueFrom(authenticationService.userObservable)
      .then<void>((user: User): Promise<void> => createUserWithPasskey(auth, functions, name).then<void>((): Promise<void> => matSnackBar.open("Sign-up successful.", "Okay") && setDoc(doc(firestore, "/profiles/" + user.uid) as DocumentReference<ProfileDocument>, {
        name: name,
      }).then<void>((): void => void(0))).catch<never>((firebaseWebAuthnError: FirebaseWebAuthnError): never => matSnackBar.open(firebaseWebAuthnError.message, "Okay") && ((): never => {
        throw firebaseWebAuthnError;
      })())))(this.formGroup.value.name) : void(0);
  }

  private readonly statusSubject: BehaviorSubject<SignInFormStatus>;

  public readonly formGroup: FormGroup<SignInForm>;
  public readonly signInWithPasskey: () => Promise<void>;
  public readonly statusObservable: Observable<SignInFormStatus>;
  public readonly submit: () => void;

}
