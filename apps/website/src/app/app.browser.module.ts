import { APP_ID, Injector, NgModule }                                                            from "@angular/core";
import { Analytics, getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from "@angular/fire/analytics";
import { FirebaseApp, initializeApp, provideFirebaseApp }                                        from "@angular/fire/app";
import { AppCheck, initializeAppCheck, provideAppCheck }                                         from "@angular/fire/app-check";
import { Auth, getAuth, provideAuth }                                                            from "@angular/fire/auth";
import { Firestore, getFirestore, provideFirestore }                                             from "@angular/fire/firestore";
import { Functions, getFunctions, provideFunctions }                                             from "@angular/fire/functions";
import { ReactiveFormsModule }                                                                   from "@angular/forms";
import { BrowserModule }                                                                         from "@angular/platform-browser";
import { BrowserAnimationsModule }                                                               from "@angular/platform-browser/animations";
import { RouterModule }                                                                          from "@angular/router";
import { TransferHttpCacheModule }                                                               from "@nguniversal/common";
import { environment }                                                                           from "../environments/environment";
import { AppComponent }                                                                          from "./app.component";
import { AsideComponent }                                                                        from "./components";
import { AppCheckOptionsService }                                                                from "./services";


const baseTitle = "FirebaseWebAuthn";

@NgModule({
  declarations: [AppComponent],
  imports: [
    AsideComponent,
    BrowserAnimationsModule,
    BrowserModule,
    provideAnalytics((): Analytics => getAnalytics()),
    provideAppCheck((injector: Injector): AppCheck => initializeAppCheck(undefined, injector.get(AppCheckOptionsService).appCheckOptions(environment.app, environment.recaptchaSiteKey))),
    provideAuth((): Auth => getAuth()),
    provideFirebaseApp((): FirebaseApp => initializeApp(environment.firebase)),
    provideFirestore((): Firestore => getFirestore()),
    provideFunctions((): Functions => getFunctions()),
    ReactiveFormsModule,
    RouterModule.forRoot(
      [
        {
          loadComponent: () => import("./components/home").then((m) => m.HomeComponent),
          path: "",
          pathMatch: "full",
          title: baseTitle,
        },
        {
          loadComponent: () => import("./components/otherwise").then((m) => m.OtherwiseComponent),
          path: "**",
          title: baseTitle + " | Page not found",
        },
      ],
      {
        initialNavigation: "enabledBlocking",
        scrollPositionRestoration: "enabled",
      },
    ),
    TransferHttpCacheModule,
  ],
  providers: [
    ScreenTrackingService,
    UserTrackingService,
    {
      provide: APP_ID,
      useValue: "serverApp",
    }
  ],
  bootstrap: [AppComponent],
})
export class AppBrowserModule {}
