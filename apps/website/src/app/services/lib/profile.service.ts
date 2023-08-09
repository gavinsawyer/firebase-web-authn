import { isPlatformBrowser }                                                                  from "@angular/common";
import { Inject, Injectable, PLATFORM_ID, signal, Signal }                                    from "@angular/core";
import { toSignal }                                                                           from "@angular/core/rxjs-interop";
import { Auth, onIdTokenChanged, User }                                                       from "@angular/fire/auth";
import { doc, docSnapshots, DocumentReference, DocumentSnapshot, Firestore }                  from "@angular/fire/firestore";
import { catchError, filter, map, Observable, Observer, startWith, switchMap, TeardownLogic } from "rxjs";
import { ProfileDocument }                                                                    from "../../interfaces";
import { AuthenticationService }                                                              from "../index";


@Injectable({
  providedIn: "root"
})
export class ProfileService {

  public profileDocument: Signal<ProfileDocument | null>;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,

    auth:                  Auth,
    authenticationService: AuthenticationService,
    firestore:             Firestore,
  ) {
    this
      .profileDocument = isPlatformBrowser(platformId) ? toSignal<ProfileDocument | null>(
        new Observable<User | null>(
          (userObserver: Observer<User | null>): TeardownLogic => onIdTokenChanged(
            auth,
            (user: User | null) => userObserver.next(user),
          ),
        ).pipe<User | null, User, ProfileDocument, ProfileDocument | null>(
          startWith<User | null>(auth.currentUser),
          filter<User | null, User>(
            (user: User | null): user is User => !!user,
          ),
          switchMap<User, Observable<ProfileDocument>>(
            (user: User): Observable<ProfileDocument> => docSnapshots<ProfileDocument>(doc(firestore, "/profiles/" + user.uid) as DocumentReference<ProfileDocument>).pipe<DocumentSnapshot<ProfileDocument>, ProfileDocument | undefined, ProfileDocument>(
              catchError<DocumentSnapshot<ProfileDocument>, Observable<DocumentSnapshot<ProfileDocument>>>(
                () => new Observable<DocumentSnapshot<ProfileDocument>>(),
              ),
              map<DocumentSnapshot<ProfileDocument>, ProfileDocument | undefined>(
                (profileDocumentSnapshot: DocumentSnapshot<ProfileDocument>): ProfileDocument | undefined => profileDocumentSnapshot.data(),
              ),
              filter<ProfileDocument | undefined, ProfileDocument>(
                (profileDocument: ProfileDocument | undefined): profileDocument is ProfileDocument => !!profileDocument,
              ),
            ),
          ),
          startWith<ProfileDocument | null>(null),
        ),
        {
          requireSync: true,
        }
      ) : signal<ProfileDocument | null>(null);
  }

}
