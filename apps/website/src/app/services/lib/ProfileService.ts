import { isPlatformBrowser }                                                              from "@angular/common";
import { inject, Injectable, PLATFORM_ID, signal, Signal }                                from "@angular/core";
import { toSignal }                                                                       from "@angular/core/rxjs-interop";
import { Auth, onIdTokenChanged, User }                                                   from "@angular/fire/auth";
import { doc, docSnapshots, DocumentReference, DocumentSnapshot, Firestore }              from "@angular/fire/firestore";
import { catchError, map, Observable, Observer, of, startWith, switchMap, TeardownLogic } from "rxjs";
import { ProfileDocument }                                                                from "../../interfaces";


@Injectable({
  providedIn: "root"
})
export class ProfileService {

  private readonly auth:       Auth      = inject<Auth>(Auth);
  private readonly firestore:  Firestore = inject<Firestore>(Firestore);

  public profileDocument$: Signal<ProfileDocument | null> = isPlatformBrowser(inject<object>(PLATFORM_ID)) ? toSignal<ProfileDocument | null>(
    new Observable<User | null>(
      (userObserver: Observer<User | null>): TeardownLogic => onIdTokenChanged(
        this.auth,
        (user: User | null) => userObserver.next(user),
      ),
    ).pipe<User | null, ProfileDocument | null>(
      startWith<User | null, [ User | null ]>(this.auth.currentUser),
      switchMap<User | null, Observable<ProfileDocument | null>>(
        (user: User | null): Observable<ProfileDocument | null> => user ? docSnapshots<ProfileDocument>(
          doc(
            this.firestore,
            "/profiles/" + user.uid,
          ) as DocumentReference<ProfileDocument>,
        ).pipe<DocumentSnapshot<ProfileDocument>, ProfileDocument | null>(
          catchError<DocumentSnapshot<ProfileDocument>, Observable<DocumentSnapshot<ProfileDocument>>>(
            () => new Observable<DocumentSnapshot<ProfileDocument>>(),
          ),
          map<DocumentSnapshot<ProfileDocument>, ProfileDocument | null>(
            (profileDocumentSnapshot: DocumentSnapshot<ProfileDocument>): ProfileDocument | null => profileDocumentSnapshot.data() || null,
          ),
        ) : of<ProfileDocument | null>(null),
      ),
    ),
    {
      requireSync: true,
    },
  ) : signal<ProfileDocument | null>(null);

}
