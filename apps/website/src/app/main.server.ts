import { APP_BASE_HREF }       from "@angular/common";
import { enableProdMode }      from "@angular/core";
import { CommonEngine }        from "@angular/ssr";
import * as express            from "express";
import { existsSync }          from "fs";
import { join }                from "path";
import "zone.js/node";
import { environment }         from "../environment";
import { WebsiteServerModule } from "./modules";


environment
  .production && enableProdMode();

export const app: () => express.Express = (): express.Express => ((distFolder: string): express.Express => ((indexHtml: "index.original.html" | "index.html"): express.Express => express().set(
  "view engine",
  "html",
).set(
  "views",
  distFolder,
).get(
  "*.*",
  express.static(
    distFolder,
    {
      maxAge: "1y",
    },
  ),
).get(
  "*",
  (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => new CommonEngine().render(
    {
      bootstrap:        WebsiteServerModule,
      documentFilePath: join(
        distFolder,
        indexHtml,
      ),
      url:              `${req.protocol}://${req.headers.host}${req.originalUrl}`,
      publicPath:       distFolder,
      providers:        [
        {
          provide:  APP_BASE_HREF,
          useValue: req.baseUrl,
        },
      ],
    },
  ).then<void>(
    (html: string): void => res.send(html) && void (0),
  ).catch<void>(
    (err): void => next(err),
  ),
))(
  existsSync(
    join(
      distFolder,
      "index.original.html",
    ),
  ) ? "index.original.html" : "index.html",
))(
  join(
    process.cwd(),
    "dist/apps/website/browser",
  ),
);

declare const __non_webpack_require__: NodeRequire;
const mainModule: NodeJS.Module | undefined = __non_webpack_require__
  .main;
const moduleFilename: string = mainModule && mainModule
  .filename || "";
(moduleFilename === __filename || moduleFilename.includes("iisnode")) && app()
  .listen(
    process.env["PORT"] || 4000,
    (): void => console.log(`Node Express server listening on http://localhost:${process.env["PORT"] || 4000}`),
  );

// noinspection JSUnusedGlobalSymbols
export { WebsiteServerModule as AppServerModule };
