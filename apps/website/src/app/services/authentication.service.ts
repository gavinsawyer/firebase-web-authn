import { isPlatformBrowser }                                   from "@angular/common";
import { Inject, Injectable, PLATFORM_ID, signal, Signal }     from "@angular/core";
import { takeUntilDestroyed, toSignal }                        from "@angular/core/rxjs-interop";
import { Auth, onIdTokenChanged, signInAnonymously, User }     from "@angular/fire/auth";
import { Observable, Observer, startWith, tap, TeardownLogic } from "rxjs";


@Injectable({
  providedIn: "root",
})
export class AuthenticationService {

  public readonly user: Signal<User | null>;

  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId: object,

    private readonly auth: Auth,
  ) {
    this
      .user = isPlatformBrowser(platformId) ? toSignal<User | null>(new Observable<User | null>((userObserver: Observer<User | null>): TeardownLogic => onIdTokenChanged(auth, (user: User | null) => userObserver.next(user))).pipe<User | null, User | null, User | null>(
        tap<User | null>(async (user: User | null): Promise<void> => user === null ? signInAnonymously(auth).then<void>((): void => void (0)).catch<void>((reason: any): void => console.error(reason)) : void(0)),
        startWith<User | null>(auth.currentUser),
        takeUntilDestroyed<User | null>(),
      ), {
        requireSync: true
      }) : signal<User | null>(null);
  }

}
