/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { type Environment } from "./app/interfaces";


export const environment: Environment = {
  app:        "website",
  apis:       {
    firebase:  {
      apiKey:            "AIzaSyBMw2wD275dSe0GgjMwnnZdH3UeEjhzjAg",
      appId:             "1:27945769308:web:22bb25b759f71244148999",
      authDomain:        "fir-web-authn.firebaseapp.com",
      measurementId:     "G-LLVC9SP3DM",
      messagingSenderId: "27945769308",
      projectId:         "fir-web-authn",
      storageBucket:     "fir-web-authn.appspot.com",
    },
    recaptcha: { siteKey: "6LchyFgtAAAAAGnkMI4bUO1NJS5hJt3K67IbrfTo" },
  },
  production: true,
};
