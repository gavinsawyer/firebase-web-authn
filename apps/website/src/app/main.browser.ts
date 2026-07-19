/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { platformBrowserDynamic }    from "@angular/platform-browser-dynamic";
import { firstValueFrom, fromEvent } from "rxjs";
import { ProjectBrowserModule }      from "./modules";


(async (): Promise<void | Event> => {
  if (document.readyState !== "complete" && document.readyState !== "interactive")
    return firstValueFrom<Event>(
      fromEvent<Event>(
        document,
        "readystatechange",
      ),
    );
})().then<void>(
  (): Promise<void> => platformBrowserDynamic().bootstrapModule<ProjectBrowserModule>(
    ProjectBrowserModule,
    { ngZoneEventCoalescing: true },
  ).then<void, void>(
    (): void => void (0),
    (error: unknown): void => console.error(error),
  ),
);
