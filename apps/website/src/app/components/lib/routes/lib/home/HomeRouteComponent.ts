/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { DOCUMENT, NgIf }                                              from "@angular/common";
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
    templateUrl: "./HomeRouteComponent.html",

    standalone: true,
  },
)
export class HomeRouteComponent
  extends RouteComponent {

  constructor() {
    super();

    afterRender(
      (): void => {
        if (this.document.defaultView && "PublicKeyCredential" in this.document.defaultView) {
          this.hasWebAuthn$.set(true);

          this.document.defaultView.PublicKeyCredential.isConditionalMediationAvailable().then<void>((conditionalMediationAvailable: boolean): void => this.hasWebAuthnConditionalMediation$.set(conditionalMediationAvailable));
          this.document.defaultView.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then<void>((userVerifyingPlatformAuthenticatorAvailable: boolean): void => this.hasWebAuthnUserVerifyingPlatformAuthenticator$.set(userVerifyingPlatformAuthenticatorAvailable));
        } else {
          this.hasWebAuthn$.set(false);
          this.hasWebAuthnConditionalMediation$.set(false);
          this.hasWebAuthnUserVerifyingPlatformAuthenticator$.set(false);
        }
      },
    );
  }

  private readonly document: Document = inject<Document>(DOCUMENT);

  public readonly authenticationService: AuthenticationService                                        = inject<AuthenticationService>(AuthenticationService);
  public readonly ellipsesService: EllipsesService                                                    = inject<EllipsesService>(EllipsesService);
  public readonly hasWebAuthn$: WritableSignal<boolean | undefined>                                   = signal<undefined>(undefined);
  public readonly hasWebAuthnConditionalMediation$: WritableSignal<boolean | undefined>               = signal<undefined>(undefined);
  public readonly hasWebAuthnUserVerifyingPlatformAuthenticator$: WritableSignal<boolean | undefined> = signal<undefined>(undefined);

}
