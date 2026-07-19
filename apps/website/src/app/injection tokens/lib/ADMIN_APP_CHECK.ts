/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { InjectionToken }                 from "@angular/core";
import { type AppCheck as AdminAppCheck } from "firebase-admin/app-check";


export const ADMIN_APP_CHECK: InjectionToken<AdminAppCheck> = new InjectionToken<AdminAppCheck>("ADMIN_APP_CHECK");
