export interface Environment {
  "app": string,
  "firebase": {
    "apiKey": string,
    "appId": string,
    "authDomain": string,
    "measurementId": string,
    "messagingSenderId": string,
    "projectId": string,
    "storageBucket": string
  },
  "production": boolean,
  "recaptchaSiteKey": string,
}
