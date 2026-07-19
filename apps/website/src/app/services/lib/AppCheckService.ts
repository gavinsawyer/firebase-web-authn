/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { isPlatformBrowser }                                                                                  from "@angular/common";
import { inject, Injectable, PLATFORM_ID }                                                                    from "@angular/core";
import { type AppCheck, type AppCheckToken, CustomProvider, initializeAppCheck, ReCaptchaEnterpriseProvider } from "@angular/fire/app-check";
import { type AppCheck as AdminAppCheck, type AppCheckToken as AdminAppCheckToken }                           from "firebase-admin/app-check";
import { ADMIN_APP_CHECK, ENVIRONMENT }                                                                       from "../../injection tokens";
import { type Environment }                                                                                   from "../../interfaces";
import { FirebaseAppService }                                                                                 from "./FirebaseAppService";


@Injectable({ providedIn: "root" })
export class AppCheckService {

  private readonly adminAppCheck: AdminAppCheck | null    = inject<AdminAppCheck>(
    ADMIN_APP_CHECK,
    { optional: true },
  );
  private readonly environment: Environment               = inject<Environment>(ENVIRONMENT);
  private readonly firebaseAppService: FirebaseAppService = inject<FirebaseAppService>(FirebaseAppService);
  private readonly platformId: NonNullable<unknown>       = inject<NonNullable<unknown>>(PLATFORM_ID);

  public readonly appCheck: AppCheck = initializeAppCheck(
    this.firebaseAppService.firebaseApp,
    {
      isTokenAutoRefreshEnabled: true,
      provider:                  isPlatformBrowser(this.platformId) ? new ReCaptchaEnterpriseProvider(this.environment.apis.recaptcha.siteKey) : this.adminAppCheck ? ((adminAppCheck: AdminAppCheck): CustomProvider => new CustomProvider(
        {
          getToken: async (): Promise<AppCheckToken> => adminAppCheck.createToken(
            this.environment.apis.firebase.appId,
            { ttlMillis: 604800000 },
          ).then<AppCheckToken>(
            (
              {
                token,
                ttlMillis,
              }: AdminAppCheckToken,
            ): AppCheckToken => ({
              token,
              expireTimeMillis: Date.now() + ttlMillis,
            }),
          ),
        },
      ))(this.adminAppCheck) : new CustomProvider(
        {
          getToken: async (): Promise<AppCheckToken> => ({
            token:            process.env[`APP_CHECK_TOKEN_${ this.environment.app.toUpperCase() }`] as string,
            expireTimeMillis: Date.now() + 604800000,
          }),
        },
      ),
    },
  );

}
