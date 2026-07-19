/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

export interface Environment {
  "app": "website";
  "apis": {
    "firebase": {
      "apiKey": string;
      "appId": string;
      "authDomain": string;
      "databaseURL"?: string;
      "measurementId"?: string;
      "messagingSenderId": string;
      "projectId": string;
      "storageBucket": string;
    };
    "recaptcha": {
      "siteKey": string;
    };
  };
  "production": boolean;
}
