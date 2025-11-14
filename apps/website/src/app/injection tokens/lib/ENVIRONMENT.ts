/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { InjectionToken }   from "@angular/core";
import { type Environment } from "../../interfaces";


export const ENVIRONMENT: InjectionToken<Environment> = new InjectionToken<Environment>("ENVIRONMENT");
