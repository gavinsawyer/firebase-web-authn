/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { APP_BASE_HREF }       from "@angular/common";
import { CommonEngine }        from "@angular/ssr";
import express                 from "express";
import { ProjectServerModule } from "./modules";
import "zone.js/node";


// noinspection JSUnusedGlobalSymbols
export { ProjectServerModule as AppServerModule };


declare const __non_webpack_require__: NodeJS.Require;

if (((moduleFilename: string): boolean => moduleFilename === __filename || moduleFilename.includes("iisnode"))(((mainModule?: NodeJS.Module): string => mainModule?.filename || "")(__non_webpack_require__.main))) {
  express().set(
    "view engine",
    "html",
  ).set(
    "views",
    `${ process.cwd() }/dist/apps/website/browser`,
  ).get(
    "*.*",
    express.static(
      `${ process.cwd() }/dist/apps/website/browser`,
      {
        maxAge: "1y",
      },
    ),
  ).get(
    "*",
    (
      req: express.Request,
      res: express.Response,
      nextFunction: express.NextFunction,
    ): Promise<void> => new CommonEngine().render(
      {
        bootstrap:        ProjectServerModule,
        documentFilePath: `${ process.cwd() }/dist/apps/website/browser/index.original.html`,
        url:              `${ req.protocol }://${ req.headers.host }${ req.originalUrl }`,
        publicPath:       `${ process.cwd() }/dist/apps/website/browser`,
        providers:        [
          {
            provide:  APP_BASE_HREF,
            useValue: req.baseUrl,
          },
        ],
      },
    ).then<void, never>(
      (html: string): void => {
        res.send(html);
        nextFunction();
      },
      (error: Error): never => {
        nextFunction(error);

        throw error;
      },
    ),
  ).listen(
    process.env["PORT"] || 4000,
    (): void => console.log(`Node Express server listening on http://localhost:${ process.env["PORT"] || 4000 }`),
  );
}
