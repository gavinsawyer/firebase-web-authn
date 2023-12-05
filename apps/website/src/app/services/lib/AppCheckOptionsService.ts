import { isPlatformBrowser }                                                   from "@angular/common";
import { inject, Injectable, PLATFORM_ID }                                     from "@angular/core";
import { AppCheckOptions, AppCheckToken, CustomProvider, ReCaptchaV3Provider } from "@angular/fire/app-check";
import { ENVIRONMENT }                                                         from "../../injection tokens";
import { Environment }                                                         from "../../interfaces";


@Injectable({
  providedIn: "root",
})
export class AppCheckOptionsService {

  private readonly environment: Environment = inject<Environment>(ENVIRONMENT);

  public readonly appCheckOptions: AppCheckOptions = isPlatformBrowser(inject<object>(PLATFORM_ID)) ? {
    isTokenAutoRefreshEnabled: true,
    provider:                  new ReCaptchaV3Provider(this.environment.recaptchaSiteKey),
  } : {
    isTokenAutoRefreshEnabled: false,
    provider:                  new CustomProvider(
      {
        getToken: (): Promise<AppCheckToken> => Promise.resolve(
          {
            token:            process.env["APP_CHECK_TOKEN_" + this.environment.project.toUpperCase()] as string,
            expireTimeMillis: Date.now(),
          },
        ),
      },
    ),
  };

}
