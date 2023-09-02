import { enableProdMode }         from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { environment }            from "../environment";
import { AppBrowserModule }       from "./modules";


environment
  .production && enableProdMode();

(async (bootstrap: () => Promise<void>): Promise<void> => document.readyState === "complete" ? bootstrap() : document.addEventListener<"DOMContentLoaded">(
  "DOMContentLoaded",
  bootstrap,
))(
  async (): Promise<void> => platformBrowserDynamic().bootstrapModule<AppBrowserModule>(AppBrowserModule).then<void, never>(
    (): void => void (0),
  ).catch<void>(
    (err): void => console.error(err),
  ),
);
