import { APP_BASE_HREF }   from "@angular/common";
import { enableProdMode }  from "@angular/core";
import { ngExpressEngine } from "@nguniversal/express-engine";
import * as express        from "express";
import { existsSync }      from "fs";
import { join }            from "path";
import { environment }     from "../environment";
import { AppServerModule } from "./modules";
import "zone.js/dist/zone-node";


environment
  .production && enableProdMode();

export const app: () => express.Express = (): express.Express => ((distFolder: string): express.Express => ((indexHtml: "index.original.html" | "index"): express.Express => express().engine(
  "html",
  ngExpressEngine(
    {
      bootstrap: AppServerModule,
    },
  ),
).set(
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
  (req, res): void => res.render(
    indexHtml,
    {
      req,
      res,
      providers: [
        {
          provide:  APP_BASE_HREF,
          useValue: req.baseUrl,
        },
      ],
    },
    (error: Error, html?: string) => res.send(html).end(),
  ),
))(
  existsSync(
    join(
      distFolder,
      "index.original.html",
    ),
  ) ? "index.original.html" : "index"
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

export { AppServerModule };
