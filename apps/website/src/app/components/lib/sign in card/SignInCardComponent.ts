import { CommonModule }                                                                           from "@angular/common";
import { Component, Signal }                                                                      from "@angular/core";
import { takeUntilDestroyed, toSignal }                                                           from "@angular/core/rxjs-interop";
import { Auth, onAuthStateChanged, User }                                                         from "@angular/fire/auth";
import { doc, DocumentReference, Firestore, setDoc }                                              from "@angular/fire/firestore";
import { Functions }                                                                              from "@angular/fire/functions";
import { FormControl, FormGroup, ReactiveFormsModule, Validators }                                from "@angular/forms";
import { MatButtonModule }                                                                        from "@angular/material/button";
import { MatCardModule }                                                                          from "@angular/material/card";
import { MatFormFieldModule }                                                                     from "@angular/material/form-field";
import { MatIconModule }                                                                          from "@angular/material/icon";
import { MatInputModule }                                                                         from "@angular/material/input";
import { MatSnackBar, MatSnackBarModule }                                                         from "@angular/material/snack-bar";
import { createUserWithPasskey, FirebaseWebAuthnError, signInWithPasskey }                        from "@firebase-web-authn/browser";
import { firstValueFrom, Observable, Observer, ReplaySubject, startWith, Subject, TeardownLogic } from "rxjs";
import { ProfileDocument }                                                                        from "../../../interfaces";
import { AuthenticationService }                                                                  from "../../../services";


@Component({
  imports:     [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
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

  private readonly statusObservable: Observable<"unsent" | "pending" | "complete">;
  private readonly statusSubject:    Subject<"unsent" | "pending" | "complete">;

  public readonly formGroup: FormGroup<{ "name": FormControl<string> }>;
  public readonly status$:   Signal<"unsent" | "pending" | "complete">;

  public readonly signInWithPasskey: () => Promise<void>;
  public readonly submit:            () => void;

  constructor(
    private readonly auth:                  Auth,
    private readonly authenticationService: AuthenticationService,
    private readonly firestore:             Firestore,
    private readonly functions:             Functions,
    private readonly matSnackBar:           MatSnackBar,
  ) {
    this
      .statusSubject = new ReplaySubject<"unsent" | "pending" | "complete">(1);
    this
      .statusObservable = this
      .statusSubject
      .asObservable()
      .pipe<"unsent" | "pending" | "complete", "unsent" | "pending" | "complete">(
        startWith<"unsent" | "pending" | "complete", [ "unsent" | "pending" | "complete" ]>("unsent"),
        takeUntilDestroyed<"unsent" | "pending" | "complete">()
      );
    this
      .formGroup = new FormGroup<{ "name": FormControl<string> }>(
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
    this
      .signInWithPasskey = (): Promise<void> => signInWithPasskey(
        {
          ...this.auth,
          authStateReady: async (): Promise<void> => firstValueFrom<void>(new Observable<void>(
            (userObserver: Observer<void>): TeardownLogic => onAuthStateChanged(
              this.auth,
              (): void => userObserver.next(),
            ),
          ))
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
          firebaseWebAuthnError.message,
          "Okay",
        ) && ((): never => {
          throw firebaseWebAuthnError;
        })(),
      );
    this
      .status$ = toSignal<"unsent" | "pending" | "complete">(
        this.statusObservable,
        {
          requireSync: true,
        },
      );
    this
      .submit = async (): Promise<void> => this
      .formGroup
      .value
      .name ? (async (name: string | undefined, user: User | null): Promise<void> => name && user ? (async (): Promise<void> => {
        this
          .formGroup
          .disable();

        this
          .statusSubject
          .next("pending");

        return await createUserWithPasskey(
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
          name,
        )
          .then<void>(
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
          )
          .catch<never>(
            (firebaseWebAuthnError: FirebaseWebAuthnError): never => this.matSnackBar.open(
              firebaseWebAuthnError.message,
              "Okay",
            ) && ((): never => {
              throw firebaseWebAuthnError;
            })(),
          );
      })() : void (0))(
        this.formGroup.value.name,
        this.authenticationService.user$(),
      ) : void (0);
  }

}
