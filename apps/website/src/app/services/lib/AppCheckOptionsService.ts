import { isPlatformBrowser }                                                   from "@angular/common";
import { Inject, Injectable, PLATFORM_ID }                                     from "@angular/core";
import { AppCheckOptions, AppCheckToken, CustomProvider, ReCaptchaV3Provider } from "@angular/fire/app-check";
import { ENVIRONMENT }                                                         from "../../injection tokens";
import { Environment }                                                         from "../../interfaces";


@Injectable({
  providedIn: "root",
})
export class AppCheckOptionsService {

  public readonly appCheckOptions: AppCheckOptions;

  constructor(
    @Inject(ENVIRONMENT) private readonly environment: Environment,
    @Inject(PLATFORM_ID) private readonly platformId:  object,
  ) {
    this
      .appCheckOptions = isPlatformBrowser(this.platformId) ? {
        isTokenAutoRefreshEnabled: true,
        provider:                  new ReCaptchaV3Provider(this.environment.recaptchaSiteKey),
      } : {
        isTokenAutoRefreshEnabled: false,
        provider:                  new CustomProvider(
          {
            getToken: (): Promise<AppCheckToken> => Promise.resolve(
              {
                token:            process.env["APP_CHECK_TOKEN_" + this.environment.app.toUpperCase()] as string,
                expireTimeMillis: Date.now(),
              },
            ),
          },
        ),
      };
  }

}
