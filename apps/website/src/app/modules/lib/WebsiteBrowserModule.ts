import { Injector, NgModule }                                                      from "@angular/core";
import { getAnalytics }                                                            from "@angular/fire/analytics";
import { Analytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from "@angular/fire/analytics";
import { FirebaseApp, initializeApp, provideFirebaseApp }                          from "@angular/fire/app";
import { AppCheck, initializeAppCheck, provideAppCheck }                           from "@angular/fire/app-check";
import { Auth, getAuth, provideAuth }                                              from "@angular/fire/auth";
import { Firestore, getFirestore, provideFirestore }                               from "@angular/fire/firestore";
import { Functions, getFunctions, provideFunctions }                               from "@angular/fire/functions";
import { ReactiveFormsModule }                                                     from "@angular/forms";
import { MatButtonModule }                                                         from "@angular/material/button";
import { MatDividerModule }                                                        from "@angular/material/divider";
import { MatIconModule }                                                           from "@angular/material/icon";
import { MatMenuModule }                                                           from "@angular/material/menu";
import { MatSnackBarModule }                                                       from "@angular/material/snack-bar";
import { BrowserModule, provideClientHydration }                                   from "@angular/platform-browser";
import { BrowserAnimationsModule }                                                 from "@angular/platform-browser/animations";
import { RouterModule }                                                            from "@angular/router";
import { gitInfo }                                                                 from "../../../.git-info";
import { packageVersion }                                                          from "../../../.package-version";
import { environment }                                                             from "../../../environment";
import { RootComponent, routes, SignedInComponent, SignedOutComponent }            from "../../components";
import { ENVIRONMENT, GIT_INFO, PACKAGE_VERSION }                                  from "../../injection tokens";
import { AppCheckOptionsService }                                                  from "../../services";


@NgModule({
  bootstrap:    [
    RootComponent,
  ],
  declarations: [
    RootComponent,
  ],
  imports:      [
    BrowserAnimationsModule,
    BrowserModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
    provideAnalytics(
      (): Analytics => getAnalytics(),
    ),
    provideAppCheck(
      (injector: Injector): AppCheck => initializeAppCheck(
        undefined,
        injector.get(AppCheckOptionsService).appCheckOptions,
      ),
    ),
    provideAuth(
      (): Auth => getAuth(),
    ),
    provideFirebaseApp(
      (): FirebaseApp => initializeApp(environment.firebase),
    ),
    provideFirestore(
      (): Firestore => getFirestore(),
    ),
    provideFunctions(
      (): Functions => getFunctions(),
    ),
    ReactiveFormsModule,
    RouterModule.forRoot(
      routes,
      {
        bindToComponentInputs:     true,
        initialNavigation:         "enabledBlocking",
        scrollPositionRestoration: "enabled",
      },
    ),
    SignedInComponent,
    SignedOutComponent,
    MatDividerModule,
  ],
  providers:    [
    {
      provide:  ENVIRONMENT,
      useValue: environment,
    },
    {
      provide:  GIT_INFO,
      useValue: gitInfo,
    },
    {
      provide:  PACKAGE_VERSION,
      useValue: packageVersion,
    },
    provideClientHydration(),
    ScreenTrackingService,
    UserTrackingService,
  ],
})
export class WebsiteBrowserModule {
}
