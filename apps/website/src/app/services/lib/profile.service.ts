import { isPlatformBrowser }                                                                                    from "@angular/common";
import { Inject, Injectable, PLATFORM_ID, signal, Signal }                                                      from "@angular/core";
import { toSignal }                                                                                             from "@angular/core/rxjs-interop";
import { Auth, onIdTokenChanged, User }                                                                         from "@angular/fire/auth";
import { doc, docSnapshots, DocumentReference, DocumentSnapshot, Firestore }                                    from "@angular/fire/firestore";
import { catchError, distinctUntilChanged, map, Observable, Observer, of, startWith, switchMap, TeardownLogic } from "rxjs";
import { ProfileDocument }                                                                                      from "../../interfaces";


@Injectable({
  providedIn: "root"
})
export class ProfileService {

  public profileDocument$: Signal<ProfileDocument | undefined>;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,

    auth:                  Auth,
    firestore:             Firestore,
  ) {
    this
      .profileDocument$ = isPlatformBrowser(platformId) ? toSignal<ProfileDocument | undefined>(
        new Observable<User | null>(
          (userObserver: Observer<User | null>): TeardownLogic => onIdTokenChanged(
            auth,
            (user: User | null) => userObserver.next(user),
          ),
        ).pipe<User | null, User | null, ProfileDocument | undefined>(
          startWith<User | null, [ User | null ]>(auth.currentUser),
          distinctUntilChanged<User | null>(),
          switchMap<User | null, Observable<ProfileDocument | undefined>>(
            (user: User | null): Observable<ProfileDocument | undefined> => user ? docSnapshots<ProfileDocument>(doc(firestore, "/profiles/" + user.uid) as DocumentReference<ProfileDocument>).pipe<DocumentSnapshot<ProfileDocument>, ProfileDocument | undefined>(
              catchError<DocumentSnapshot<ProfileDocument>, Observable<DocumentSnapshot<ProfileDocument>>>(
                () => new Observable<DocumentSnapshot<ProfileDocument>>(),
              ),
              map<DocumentSnapshot<ProfileDocument>, ProfileDocument | undefined>(
                (profileDocumentSnapshot: DocumentSnapshot<ProfileDocument>): ProfileDocument | undefined => profileDocumentSnapshot.data(),
              ),
            ) : of<ProfileDocument | undefined>(undefined),
          ),
        ),
        {
          requireSync: true,
        }
      ) : signal<ProfileDocument | undefined>(undefined);
  }

}
