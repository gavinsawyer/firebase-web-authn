import { isPlatformBrowser }                                                   from "@angular/common";
import { Inject, Injectable, PLATFORM_ID }                                     from "@angular/core";
import { CustomProvider, ReCaptchaV3Provider, AppCheckToken, AppCheckOptions } from "@angular/fire/app-check"


@Injectable({
  providedIn: "root",
})
export class AppCheckOptionsService {

  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId: object,
  ) {
    this
      .appCheckOptions = (recaptchaSiteKey: string): AppCheckOptions => isPlatformBrowser(platformId) ? {
        isTokenAutoRefreshEnabled: true,
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      } : {
        isTokenAutoRefreshEnabled: false,
        provider: new CustomProvider({
          getToken: (): Promise<AppCheckToken> => Promise.resolve({
            token: process.env["AppCheckUniversalToken"] as string,
            expireTimeMillis: Date.now(),
          }),
        }),
      };
  }

  public readonly appCheckOptions: (recaptchaSiteKey: string) => AppCheckOptions

}
