/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { getApps, initializeApp } from "firebase-admin/app";


if (getApps().length === 0)
  initializeApp();

export * from "../";
