/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { InjectionToken }   from "@angular/core";
import { type Environment } from "../../interfaces";


export const ENVIRONMENT: InjectionToken<Environment> = new InjectionToken<Environment>("ENVIRONMENT");
