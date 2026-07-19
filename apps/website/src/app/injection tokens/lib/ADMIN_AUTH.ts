/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { InjectionToken }         from "@angular/core";
import { type Auth as AdminAuth } from "firebase-admin/auth";


export const ADMIN_AUTH: InjectionToken<AdminAuth> = new InjectionToken("ADMIN_AUTH");
