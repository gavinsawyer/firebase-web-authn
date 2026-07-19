/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { InjectionToken } from "@angular/core";
import { type Response }  from "express";


export const RESPONSE: InjectionToken<Response> = new InjectionToken<Response>("RESPONSE");
