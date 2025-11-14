/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { isPlatformServer }                       from "@angular/common";
import { Component, inject, OnInit, PLATFORM_ID } from "@angular/core";
import { MatIconModule }                          from "@angular/material/icon";
import { RouterLink }                             from "@angular/router";
import { type Response }                          from "express";
import { RouteComponent }                         from "../../../../../components";
import { RESPONSE }                               from "../../../../../injection tokens";
import { PathService }                            from "../../../../../services";


@Component(
  {
    imports:     [
      MatIconModule,
      RouterLink,
    ],
    selector:    "website-otherwise-route",
    templateUrl: "./OtherwiseRouteComponent.html",

    standalone: true,
  },
)
export class OtherwiseRouteComponent
  extends RouteComponent
  implements OnInit {

  private readonly platformId: object        = inject<object>(PLATFORM_ID);
  private readonly response: Response | null = inject<Response | null>(
    RESPONSE,
    {
      optional: true,
    },
  );

  public readonly pathService: PathService = inject<PathService>(PathService);

  override ngOnInit(): void {
    super.ngOnInit();

    if (isPlatformServer(this.platformId))
      this.response?.status(404);
  }

}
