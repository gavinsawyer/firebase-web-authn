/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { Component, inject }                                      from "@angular/core";
import { MatButtonModule }                                        from "@angular/material/button";
import { MatCardModule }                                          from "@angular/material/card";
import { MatIconModule }                                          from "@angular/material/icon";
import { AuthenticationService, EllipsesService, ProfileService } from "../../../services";


@Component(
  {
    imports:     [
      MatButtonModule,
      MatCardModule,
      MatIconModule,

    ],
    selector:    "website-signed-in",
    styleUrls:   [
      "./SignedInComponent.sass",
    ],
    templateUrl: "./SignedInComponent.html",

    standalone: true,
  },
)
export class SignedInComponent {

  public readonly authenticationService: AuthenticationService = inject<AuthenticationService>(AuthenticationService);
  public readonly ellipsesService: EllipsesService             = inject<EllipsesService>(EllipsesService);
  public readonly profileService: ProfileService               = inject<ProfileService>(ProfileService);

}
