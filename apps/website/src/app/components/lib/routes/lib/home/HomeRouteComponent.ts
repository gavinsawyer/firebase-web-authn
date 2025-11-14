/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { NgIf }                                                        from "@angular/common";
import { afterRender, Component, inject, signal, type WritableSignal } from "@angular/core";
import { MatIconModule }                                               from "@angular/material/icon";
import { RouterLink }                                                  from "@angular/router";
import { RouteComponent }                                              from "../../../../../components";
import { AuthenticationService, EllipsesService }                      from "../../../../../services";


@Component(
  {
    imports:     [
      MatIconModule,
      NgIf,
      RouterLink,
    ],
    selector:    "website-home-route",
    templateUrl: "./HomeRouteComponent.html",

    standalone: true,
  },
)
export class HomeRouteComponent
  extends RouteComponent {

  constructor() {
    super();

    afterRender(
      (): void => this.hasWebAuthn$.set(typeof PublicKeyCredential === "function"),
    );
  }

  public readonly authenticationService: AuthenticationService = inject<AuthenticationService>(AuthenticationService);
  public readonly ellipsesService: EllipsesService             = inject<EllipsesService>(EllipsesService);
  public readonly hasWebAuthn$: WritableSignal<boolean>        = signal<false>(false);

}
