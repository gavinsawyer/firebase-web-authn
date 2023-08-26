import { isPlatformBrowser }                                                   from "@angular/common";
import { Inject, Injectable, PLATFORM_ID }                                     from "@angular/core";
import { AppCheckOptions, AppCheckToken, CustomProvider, ReCaptchaV3Provider } from "@angular/fire/app-check";
import { APP_ENVIRONMENT }                                                     from "../../injection-tokens";
import { AppEnvironment }                                                      from "../../interfaces";


@Injectable({
  providedIn: "root",
})
export class AppCheckOptionsService {

  public readonly appCheckOptions: AppCheckOptions;

  constructor(
    @Inject(APP_ENVIRONMENT) appEnvironment: AppEnvironment,
    @Inject(PLATFORM_ID)     platformId:     object,
  ) {
    this
      .appCheckOptions = isPlatformBrowser(platformId) ? {
        isTokenAutoRefreshEnabled: true,
        provider:                  new ReCaptchaV3Provider(appEnvironment.recaptchaSiteKey),
      } : {
        isTokenAutoRefreshEnabled: false,
        provider:                  new CustomProvider(
          {
            getToken: (): Promise<AppCheckToken> => Promise.resolve(
              {
                token:            process.env["APP_CHECK_TOKEN_" + appEnvironment.app.toUpperCase()] as string,
                expireTimeMillis: Date.now(),
              },
            ),
          },
        ),
      };
  }

}
