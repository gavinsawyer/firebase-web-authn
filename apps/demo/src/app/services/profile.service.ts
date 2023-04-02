import { Injectable }                                                        from "@angular/core";
import { User }                                                              from "@angular/fire/auth";
import { doc, docSnapshots, DocumentReference, DocumentSnapshot, Firestore } from "@angular/fire/firestore";
import { catchError, filter, map, mergeMap, Observable, of, retry, Subject } from "rxjs";
import { ProfileDocument }                                                   from "../interfaces";
import { AuthenticationService }                                             from "./authentication.service";


@Injectable({
  providedIn: "root"
})
export class ProfileService {

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly firestore: Firestore,
  ) {
    this
      .profileDocumentObservable = authenticationService
      .userObservable
      .pipe<DocumentSnapshot<ProfileDocument>, ProfileDocument | undefined, ProfileDocument, ProfileDocument, ProfileDocument>(
        mergeMap<User, Observable<DocumentSnapshot<ProfileDocument>>>((user: User): Observable<DocumentSnapshot<ProfileDocument>> => user.isAnonymous ? new Subject<DocumentSnapshot<ProfileDocument>>().asObservable() : docSnapshots<ProfileDocument>(doc(firestore, "/profiles/" + user.uid) as DocumentReference<ProfileDocument>)),
        map<DocumentSnapshot<ProfileDocument>, ProfileDocument | undefined>((profileDocumentSnapshot: DocumentSnapshot<ProfileDocument>): ProfileDocument | undefined => profileDocumentSnapshot.data()),
        filter<ProfileDocument | undefined, ProfileDocument>((profileDocument: ProfileDocument | undefined): profileDocument is ProfileDocument => !!profileDocument),
        retry<ProfileDocument>({
          delay: (error) => error.code === "permission-denied" ? of<object>({}) : new Subject<ProfileDocument>().asObservable(),
        }),
        catchError<ProfileDocument, Observable<ProfileDocument>>((error) => {
          console
            .error(error);

          return new Subject<ProfileDocument>().asObservable();
        }),
      );
  }

  public readonly profileDocumentObservable: Observable<ProfileDocument>;

}
