/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { APP_BASE_HREF }                                                                                                 from "@angular/common";
import { CommonEngine }                                                                                                  from "@angular/ssr";
import compression                                                                                                       from "compression";
import cookieParser                                                                                                      from "cookie-parser";
import express                                                                                                           from "express";
import { type App as AdminFirebaseApp, cert as adminCert, getApps as adminGetApps, initializeApp as adminInitializeApp } from "firebase-admin/app";
import { type AppCheck as AdminAppCheck, getAppCheck as adminGetAppCheck }                                               from "firebase-admin/app-check";
import { type Auth as AdminAuth, getAuth as adminGetAuth }                                                               from "firebase-admin/auth";
import { ADMIN_APP_CHECK, ADMIN_AUTH, ADMIN_FIREBASE_APP, REQUEST, RESPONSE }                                            from "./injection tokens";
import { ProjectServerModule }                                                                                           from "./modules";
import "zone.js/node";


process.env["FIRESTORE_PREFER_REST"] = "true";

const adminFirebaseApp: AdminFirebaseApp = adminGetApps()[0] || adminInitializeApp(process.env["FIREBASE_SERVICE_ACCOUNT_PATH"] ? { credential: adminCert(process.env["FIREBASE_SERVICE_ACCOUNT_PATH"]) } : undefined);
const adminAppCheck: AdminAppCheck       = adminGetAppCheck(adminFirebaseApp);
const adminAuth: AdminAuth               = adminGetAuth(adminFirebaseApp);

// noinspection JSUnusedGlobalSymbols
export { ProjectServerModule as AppServerModule };


declare const __non_webpack_require__: NodeJS.Require;

if (((moduleFilename: string): boolean => moduleFilename === __filename || moduleFilename.includes("iisnode"))(((mainModule?: NodeJS.Module): string => mainModule?.filename || "")(__non_webpack_require__.main)))
  void express().use(compression()).use(cookieParser()).set(
    "view engine",
    "html",
  ).set(
    "views",
    `${ process.cwd() }/dist/apps/website/browser`,
  ).get(
    "*.*",
    express.static(
      `${ process.cwd() }/dist/apps/website/browser`,
      { maxAge: "1y" },
    ),
  ).get(
    "*",
    (
      request: express.Request,
      response: express.Response,
      nextFunction: express.NextFunction,
    ): Promise<void> => new CommonEngine().render(
      {
        bootstrap:        ProjectServerModule,
        documentFilePath: `${ process.cwd() }/dist/apps/website/browser/index.original.html`,
        url:              `${ request.protocol }://${ request.headers.host }${ request.originalUrl }`,
        publicPath:       `${ process.cwd() }/dist/apps/website/browser`,
        providers:        [
          {
            provide:  APP_BASE_HREF,
            useValue: request.baseUrl,
          },
          {
            provide:  ADMIN_APP_CHECK,
            useValue: adminAppCheck,
          },
          {
            provide:  ADMIN_AUTH,
            useValue: adminAuth,
          },
          {
            provide:  ADMIN_FIREBASE_APP,
            useValue: adminFirebaseApp,
          },
          {
            provide:  REQUEST,
            useValue: request,
          },
          {
            provide:  RESPONSE,
            useValue: response,
          },
        ],
      },
    ).then<void, void>(
      (html: string): void => void response.send(html),
      (error: Error): void => nextFunction(error),
    ),
  ).listen(
    process.env["PORT"] || 4000,
    (error?: Error): void => {
      if (error)
        throw error;

      console.log(`Node Express server listening on http://localhost:${ process.env["PORT"] || 4000 }`);
    },
  );
