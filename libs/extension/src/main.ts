import { getApps, initializeApp } from "firebase-admin/app";


getApps()
  .length === 0 && initializeApp();

export * from "./lib/api.js";
