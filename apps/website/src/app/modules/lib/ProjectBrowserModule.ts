/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { provideHttpClient, withFetch }                                                                                            from "@angular/common/http";
import { type Injector, NgModule }                                                                                                 from "@angular/core";
import { type Analytics, provideAnalytics, ScreenTrackingService, UserTrackingService }                                            from "@angular/fire/analytics";
import { type FirebaseApp, provideFirebaseApp }                                                                                    from "@angular/fire/app";
import { type AppCheck, provideAppCheck }                                                                                          from "@angular/fire/app-check";
import { type Auth, provideAuth }                                                                                                  from "@angular/fire/auth";
import { AngularFirestoreModule }                                                                                                  from "@angular/fire/compat/firestore";
import { type Database, provideDatabase }                                                                                          from "@angular/fire/database";
import { type Firestore, provideFirestore }                                                                                        from "@angular/fire/firestore";
import { type Functions, provideFunctions }                                                                                        from "@angular/fire/functions";
import { ReactiveFormsModule }                                                                                                     from "@angular/forms";
import { MatButtonModule }                                                                                                         from "@angular/material/button";
import { MatDividerModule }                                                                                                        from "@angular/material/divider";
import { MatIconModule }                                                                                                           from "@angular/material/icon";
import { MatMenuModule }                                                                                                           from "@angular/material/menu";
import { MatSnackBarModule }                                                                                                       from "@angular/material/snack-bar";
import { BrowserModule }                                                                                                           from "@angular/platform-browser";
import { BrowserAnimationsModule }                                                                                                 from "@angular/platform-browser/animations";
import { RouterModule, RouterOutlet }                                                                                              from "@angular/router";
import { gitInfoPartial }                                                                                                          from "../../../.gitInfoPartial";
import { packageVersion }                                                                                                          from "../../../.packageVersion";
import { environment }                                                                                                             from "../../../environment";
import { RootComponent, routes, SignedInComponent, SignedOutComponent }                                                            from "../../components";
import { ENVIRONMENT, GIT_INFO_PARTIAL, PACKAGE_VERSION }                                                                          from "../../injection tokens";
import { AnalyticsService, AppCheckService, AuthService, DatabaseService, FirebaseAppService, FirestoreService, FunctionsService } from "../../services";


@NgModule(
  {
    bootstrap:    [ RootComponent ],
    declarations: [ RootComponent ],
    imports:      [
      AngularFirestoreModule.enablePersistence(),
      BrowserAnimationsModule,
      BrowserModule,
      MatButtonModule,
      MatDividerModule,
      MatIconModule,
      MatMenuModule,
      MatSnackBarModule,
      ReactiveFormsModule,
      RouterModule.forRoot(
        routes,
        {
          bindToComponentInputs:     true,
          initialNavigation:         "enabledBlocking",
          scrollPositionRestoration: "enabled",
        },
      ),
      RouterOutlet,
      SignedInComponent,
      SignedOutComponent,
    ],
    providers:    [
      {
        provide:  ENVIRONMENT,
        useValue: environment,
      },
      {
        provide:  GIT_INFO_PARTIAL,
        useValue: gitInfoPartial,
      },
      {
        provide:  PACKAGE_VERSION,
        useValue: packageVersion,
      },
      provideAnalytics((injector: Injector): Analytics => injector.get(AnalyticsService).analytics),
      provideAppCheck((injector: Injector): AppCheck => injector.get(AppCheckService).appCheck),
      provideAuth((injector: Injector): Auth => injector.get(AuthService).auth),
      provideDatabase((injector: Injector): Database => injector.get(DatabaseService).database),
      provideFirebaseApp((injector: Injector): FirebaseApp => injector.get(FirebaseAppService).firebaseApp),
      provideFirestore((injector: Injector): Firestore => injector.get(FirestoreService).firestore),
      provideFunctions((injector: Injector): Functions => injector.get(FunctionsService).functions),
      provideHttpClient(withFetch()),
      ScreenTrackingService,
      UserTrackingService,
    ],
  },
)
export class ProjectBrowserModule {
}
