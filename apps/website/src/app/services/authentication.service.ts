import { isPlatformBrowser }                                            from "@angular/common";
import { Inject, Injectable, OnDestroy, PLATFORM_ID }                   from "@angular/core";
import { Auth, onIdTokenChanged, signInAnonymously, Unsubscribe, User } from "@angular/fire/auth";
import { Observable, shareReplay, Subject }                             from "rxjs";


@Injectable({
  providedIn: "root",
})
export class AuthenticationService implements OnDestroy {

  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId: object,

    private readonly auth: Auth,
  ) {
    this
      .unsubscribeIdTokenChanged = onIdTokenChanged(auth, async (user: User | null): Promise<void> => user ? this.userSubject.next(user) : isPlatformBrowser(platformId) ? signInAnonymously(auth).then<void>((): void => void(0)).catch<void>((firebaseError): void => console.error(firebaseError)) : void(0));
    this
      .userSubject = new Subject<User>();
    this
      .userObservable = this
      .userSubject
      .asObservable()
      .pipe<User>(
        shareReplay<User>(1),
      );

    isPlatformBrowser(platformId) || ((): void => {
      this
        .unsubscribeIdTokenChanged();
    })();
  }

  private readonly unsubscribeIdTokenChanged: Unsubscribe;
  private readonly userSubject: Subject<User>;

  public readonly userObservable: Observable<User>;

  ngOnDestroy(): void {
    this
      .unsubscribeIdTokenChanged();
  }

}
