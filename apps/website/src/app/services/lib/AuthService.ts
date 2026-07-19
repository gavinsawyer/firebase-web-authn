/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { inject, Injectable } from "@angular/core";
import { type Auth, getAuth } from "@angular/fire/auth";
import { FirebaseAppService } from "./FirebaseAppService";


@Injectable({ providedIn: "root" })
export class AuthService {

  private readonly firebaseAppService: FirebaseAppService = inject<FirebaseAppService>(FirebaseAppService);

  public readonly auth: Auth = getAuth(this.firebaseAppService.firebaseApp);

}
