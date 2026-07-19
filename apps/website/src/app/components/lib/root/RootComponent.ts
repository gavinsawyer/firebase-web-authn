/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { Component, inject }                          from "@angular/core";
import { Analytics }                                  from "@angular/fire/analytics";
import { type GitInfo }                               from "git-describe";
import { GIT_INFO_PARTIAL, PACKAGE_VERSION }          from "../../../injection tokens";
import { AuthenticationService, ConnectivityService } from "../../../services";


@Component(
  {
    selector:    "app--root",
    styleUrls:   [
      "./RootComponent.sass",
    ],
    templateUrl: "./RootComponent.html",
  },
)
export class RootComponent {

  private readonly analytics: Analytics = inject<Analytics>(Analytics);

  protected readonly authenticationService: AuthenticationService = inject<AuthenticationService>(AuthenticationService);
  protected readonly connectivityService: ConnectivityService     = inject<ConnectivityService>(ConnectivityService);
  protected readonly gitInfoPartial: Partial<GitInfo>             = inject<Partial<GitInfo>>(GIT_INFO_PARTIAL);
  protected readonly packageVersion: string                       = inject<string>(PACKAGE_VERSION);

}
