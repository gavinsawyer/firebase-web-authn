import { Location }                                                                                                                                                                                                                                                                                         from "@angular/common";
import { inject, Injectable, Signal }                                                                                                                                                                                                                                                                       from "@angular/core";
import { toSignal }                                                                                                                                                                                                                                                                                         from "@angular/core/rxjs-interop";
import { ActivationEnd, ActivationStart, ChildActivationEnd, ChildActivationStart, GuardsCheckEnd, GuardsCheckStart, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterEvent, RoutesRecognized, Scroll } from "@angular/router";
import { filter, map, startWith }                                                                                                                                                                                                                                                                           from "rxjs";


@Injectable({
  providedIn: "root",
})
export class PathService {

  public readonly path$: Signal<string> = toSignal<string>(
    inject<Router>(Router).events.pipe<NavigationEnd, string, string>(
      filter<RouterEvent | NavigationStart | NavigationEnd | NavigationCancel | NavigationError | RoutesRecognized | GuardsCheckStart | GuardsCheckEnd | RouteConfigLoadStart | RouteConfigLoadEnd | ChildActivationStart | ChildActivationEnd | ActivationStart | ActivationEnd | Scroll | ResolveStart | ResolveEnd, NavigationEnd>(
        (routerEvent: RouterEvent | NavigationStart | NavigationEnd | NavigationCancel | NavigationError | RoutesRecognized | GuardsCheckStart | GuardsCheckEnd | RouteConfigLoadStart | RouteConfigLoadEnd | ChildActivationStart | ChildActivationEnd | ActivationStart | ActivationEnd | Scroll | ResolveStart | ResolveEnd): routerEvent is NavigationEnd => routerEvent instanceof NavigationEnd,
      ),
      map<NavigationEnd, string>(
        (navigationEnd: NavigationEnd): string => navigationEnd.url.split("?")[0],
      ),
      startWith<string, [ string ]>(inject<Location>(Location).path()),
    ),
    {
      requireSync: true,
    },
  );

}
