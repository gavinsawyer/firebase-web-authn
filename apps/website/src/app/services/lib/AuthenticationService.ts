import { isPlatformBrowser }                                                         from "@angular/common";
import { Inject, Injectable, PLATFORM_ID, signal, Signal }                           from "@angular/core";
import { toSignal }                                                                  from "@angular/core/rxjs-interop";
import { Auth, onIdTokenChanged, signInAnonymously, User }                           from "@angular/fire/auth";
import { distinctUntilChanged, Observable, Observer, startWith, tap, TeardownLogic } from "rxjs";


@Injectable({
  providedIn: "root",
})
export class AuthenticationService {

  public readonly user$: Signal<User | null>;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,

    private readonly auth: Auth,
  ) {
    this
      .user$ = isPlatformBrowser(this.platformId) ? toSignal<User | null>(
        new Observable<User | null>(
          (userObserver: Observer<User | null>): TeardownLogic => onIdTokenChanged(
            this.auth,
            (user: User | null): void => userObserver.next(user),
          ),
        ).pipe<User | null, User | null, User | null>(
          startWith<User | null, [ User | null ]>(this.auth.currentUser),
          distinctUntilChanged<User | null>(),
          tap<User | null>(
            async (user: User | null): Promise<void> => user === null ? signInAnonymously(this.auth).then<void>(
              (): void => void (0),
            ).catch<void>(
              (reason: unknown): void => console.error(reason),
            ) : void (0),
          ),
        ),
        {
          requireSync: true,
        },
      ) : signal<User | null>(null);
  }

}
