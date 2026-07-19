/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { isPlatformBrowser }                                    from "@angular/common";
import { inject, Injectable, PLATFORM_ID, signal, type Signal } from "@angular/core";
import { toSignal }                                             from "@angular/core/rxjs-interop";
import { Database, type DataSnapshot, onValue, ref }            from "@angular/fire/database";
import { Observable, type Observer, type TeardownLogic }        from "rxjs";


@Injectable({ providedIn: "root" })
export class ConnectivityService {

  private readonly database: Database               = inject<Database>(Database);
  private readonly platformId: NonNullable<unknown> = inject<NonNullable<unknown>>(PLATFORM_ID);

  public readonly connected$: Signal<boolean | undefined> = isPlatformBrowser(this.platformId) ? toSignal<boolean>(
    new Observable<boolean>(
      (connectedObserver: Observer<boolean>): TeardownLogic => onValue(
        ref(
          this.database,
          ".info/connected",
        ),
        (dataSnapshot: DataSnapshot): void => connectedObserver.next(dataSnapshot.val()),
      ),
    ),
  ) : signal<false>(false);

}
