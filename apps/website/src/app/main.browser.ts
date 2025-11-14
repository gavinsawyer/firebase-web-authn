/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { ProjectBrowserModule }   from "./modules";


(async (bootstrap: () => Promise<void>): Promise<void> => document.readyState === "complete" ? bootstrap() : document.addEventListener<"DOMContentLoaded">(
  "DOMContentLoaded",
  bootstrap,
  {
    once: true,
  },
))(
  (): Promise<void> => platformBrowserDynamic().bootstrapModule<ProjectBrowserModule>(ProjectBrowserModule).then<void, void>(
    (): void => void (0),
    (error: unknown): void => console.error(error),
  ),
);
