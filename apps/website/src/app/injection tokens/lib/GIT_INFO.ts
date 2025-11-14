/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { InjectionToken } from "@angular/core";
import { type GitInfo }   from "git-describe";


export const GIT_INFO: InjectionToken<Partial<GitInfo>> = new InjectionToken<Partial<GitInfo>>("GIT_INFO");
