import { isPlatformBrowser, NgIf }                from "@angular/common";
import { Component, inject, PLATFORM_ID }         from "@angular/core";
import { MatIconModule }                          from "@angular/material/icon";
import { RouterLink }                             from "@angular/router";
import { RouteComponent }                         from "../../../../../components";
import { AuthenticationService, EllipsesService } from "../../../../../services";


@Component({
  imports:     [
    MatIconModule,
    NgIf,
    RouterLink,
  ],
  selector:    "website-home-route",
  standalone:  true,
  styleUrls:   [
    "./HomeRouteComponent.sass",
  ],
  templateUrl: "./HomeRouteComponent.html",
})
export class HomeRouteComponent extends RouteComponent {

  public readonly authenticationService: AuthenticationService = inject<AuthenticationService>(AuthenticationService);
  public readonly ellipsesService:       EllipsesService       = inject<EllipsesService>(EllipsesService);
  public readonly webAuthnUnsupported:   boolean               = isPlatformBrowser(inject<object>(PLATFORM_ID)) && !window.PublicKeyCredential;

}
