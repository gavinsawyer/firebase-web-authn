import { Location }                                                                                                                                                                                                                                                                                         from "@angular/common";
import { Injectable, Signal }                                                                                                                                                                                                                                                                               from "@angular/core";
import { toSignal }                                                                                                                                                                                                                                                                                         from "@angular/core/rxjs-interop";
import { ActivationEnd, ActivationStart, ChildActivationEnd, ChildActivationStart, GuardsCheckEnd, GuardsCheckStart, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterEvent, RoutesRecognized, Scroll } from "@angular/router";
import { distinctUntilChanged, filter, map, startWith }                                                                                                                                                                                                                                                     from "rxjs";


@Injectable({
  providedIn: "root",
})
export class PathService {

  public readonly path$: Signal<string>;

  constructor(
    location: Location,
    router:   Router,
  ) {
    this
      .path$ = toSignal<string>(
        router.events.pipe<NavigationEnd, string, string, string>(
          filter<RouterEvent | NavigationStart | NavigationEnd | NavigationCancel | NavigationError | RoutesRecognized | GuardsCheckStart | GuardsCheckEnd | RouteConfigLoadStart | RouteConfigLoadEnd | ChildActivationStart | ChildActivationEnd | ActivationStart | ActivationEnd | Scroll | ResolveStart | ResolveEnd, NavigationEnd>(
            (routerEvent: RouterEvent | NavigationStart | NavigationEnd | NavigationCancel | NavigationError | RoutesRecognized | GuardsCheckStart | GuardsCheckEnd | RouteConfigLoadStart | RouteConfigLoadEnd | ChildActivationStart | ChildActivationEnd | ActivationStart | ActivationEnd | Scroll | ResolveStart | ResolveEnd): routerEvent is NavigationEnd => routerEvent instanceof NavigationEnd,
          ),
          map<NavigationEnd, string>(
            (navigationEnd: NavigationEnd): string => navigationEnd.url.split("?")[0],
          ),
          startWith<string, [ string ]>(location.path()),
          distinctUntilChanged<string>(),
        ),
        {
          requireSync: true,
        },
      );
  }

}
