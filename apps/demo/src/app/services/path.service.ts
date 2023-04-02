import { Inject, Injectable, PLATFORM_ID }                                                                                                                                                                                                                                                                  from "@angular/core";
import { ActivationEnd, ActivationStart, ChildActivationEnd, ChildActivationStart, GuardsCheckEnd, GuardsCheckStart, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterEvent, RoutesRecognized, Scroll } from "@angular/router";
import { filter, Observable, map, shareReplay }                                                                                                                                                                                                                                                             from "rxjs";


@Injectable({
  providedIn: "root",
})
export class PathService {

  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId: object,

    private readonly router: Router,
  ) {
    this
      .pathObservable = router
      .events
      .pipe<NavigationEnd, string, string>(
        filter<RouterEvent | NavigationStart | NavigationEnd | NavigationCancel | NavigationError | RoutesRecognized | GuardsCheckStart | GuardsCheckEnd | RouteConfigLoadStart | RouteConfigLoadEnd | ChildActivationStart | ChildActivationEnd | ActivationStart | ActivationEnd | Scroll | ResolveStart | ResolveEnd, NavigationEnd>((routerEvent: RouterEvent | NavigationStart | NavigationEnd | NavigationCancel | NavigationError | RoutesRecognized | GuardsCheckStart | GuardsCheckEnd | RouteConfigLoadStart | RouteConfigLoadEnd | ChildActivationStart | ChildActivationEnd | ActivationStart | ActivationEnd | Scroll | ResolveStart | ResolveEnd): routerEvent is NavigationEnd => routerEvent instanceof NavigationEnd),
        map<NavigationEnd, string>((navigationEnd: NavigationEnd): string => navigationEnd.url.split("?")[0]),
        shareReplay<string>(),
      );
  }

  public readonly pathObservable: Observable<string>;

}
