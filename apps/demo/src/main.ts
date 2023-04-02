import { enableProdMode }         from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppBrowserModule }       from "./app/app.browser.module";
import { environment }            from "./environments/environment";


environment
  .production && enableProdMode();

((bootstrap: () => void) => document.readyState === "complete" ? bootstrap() : document.addEventListener("DOMContentLoaded", bootstrap))(() => platformBrowserDynamic().bootstrapModule(AppBrowserModule).then<void, never>((): void => void(0)).catch<void>((err): void => console.error(err)));
