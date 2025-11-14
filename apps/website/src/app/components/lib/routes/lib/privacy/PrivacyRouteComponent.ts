/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
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
    selector:    "website-privacy-route",
    templateUrl: "./PrivacyRouteComponent.html",

    standalone: true,
  },
)
export class PrivacyRouteComponent
  extends RouteComponent {
}
