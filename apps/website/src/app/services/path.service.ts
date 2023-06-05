import { Location }                                                                                                                                                                                                                                                                                         from "@angular/common";
import { Inject, Injectable, PLATFORM_ID, Signal }                                                                                                                                                                                                                                                          from "@angular/core";
import { takeUntilDestroyed, toSignal }                                                                                                                                                                                                                                                                     from "@angular/core/rxjs-interop";
import { ActivationEnd, ActivationStart, ChildActivationEnd, ChildActivationStart, GuardsCheckEnd, GuardsCheckStart, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterEvent, RoutesRecognized, Scroll } from "@angular/router";
import { filter, map, startWith }                                                                                                                                                                                                                                                                           from "rxjs";


@Injectable({
  providedIn: "root",
})
export class PathService {

  public readonly path: Signal<string>;

  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId: object,

    private readonly location: Location,
    private readonly router: Router,
  ) {
    this
      .path = toSignal<string>(router.events.pipe<NavigationEnd, string, string, string>(
        filter<RouterEvent | NavigationStart | NavigationEnd | NavigationCancel | NavigationError | RoutesRecognized | GuardsCheckStart | GuardsCheckEnd | RouteConfigLoadStart | RouteConfigLoadEnd | ChildActivationStart | ChildActivationEnd | ActivationStart | ActivationEnd | Scroll | ResolveStart | ResolveEnd, NavigationEnd>((routerEvent: RouterEvent | NavigationStart | NavigationEnd | NavigationCancel | NavigationError | RoutesRecognized | GuardsCheckStart | GuardsCheckEnd | RouteConfigLoadStart | RouteConfigLoadEnd | ChildActivationStart | ChildActivationEnd | ActivationStart | ActivationEnd | Scroll | ResolveStart | ResolveEnd): routerEvent is NavigationEnd => routerEvent instanceof NavigationEnd),
        map<NavigationEnd, string>((navigationEnd: NavigationEnd): string => navigationEnd.url.split("?")[0]),
        startWith<string>(location.path()),
        takeUntilDestroyed<string>(),
      ), {
        requireSync: true,
      });
  }

}
