import { isPlatformBrowser }                               from "@angular/common";
import { inject, Injectable, PLATFORM_ID, signal, Signal } from "@angular/core";
import { toSignal }                                        from "@angular/core/rxjs-interop";
import { interval, map, startWith }                        from "rxjs";
import { Ellipses }                                        from "../../types";


@Injectable({
  providedIn: "root",
})
export class EllipsesService {

  public readonly ellipses$: Signal<Ellipses> = isPlatformBrowser(inject<object>(PLATFORM_ID)) ? toSignal<Ellipses>(
    interval(800).pipe<Ellipses, Ellipses>(
      map<number, Ellipses>(
        (n: number): Ellipses => ".".repeat(((n + 1) % 3) + 1) as Ellipses,
      ),
      startWith<Ellipses>("."),
    ),
    {
      requireSync: true,
    },
  ) : signal<Ellipses>(".");

}
