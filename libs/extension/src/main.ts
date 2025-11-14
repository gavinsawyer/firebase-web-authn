/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { getApps, initializeApp } from "firebase-admin/app";


if (getApps().length === 0)
  initializeApp();

export * from "./lib/api.js";
