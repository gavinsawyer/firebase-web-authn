/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

export interface Environment {
  "firebase": {
    "apiKey": string
    "appId": string
    "authDomain": string
    "measurementId": string
    "messagingSenderId": string
    "projectId": string
    "storageBucket": string
  };
  "production": boolean;
  "project": "website";
  "recaptchaSiteKey": string;
}
