/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { Component }      from "@angular/core";
import { MatIconModule }  from "@angular/material/icon";
import { RouterLink }     from "@angular/router";
import { RouteComponent } from "../../../../../components";


@Component(
  {
    imports:     [
      MatIconModule,
      RouterLink,
    ],
    templateUrl: "./PrivacyRouteComponent.html",

    standalone: true,
  },
)
export class PrivacyRouteComponent
  extends RouteComponent {
}
