/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
 */

import { NgModule }                             from "@angular/core";
import { provideServerRendering, ServerModule } from "@angular/platform-server";
import { RootComponent }                        from "../../components";
import { ProjectBrowserModule }                 from "../../modules";


@NgModule(
  {
    bootstrap: [ RootComponent ],
    imports:   [
      ProjectBrowserModule,
      ServerModule,
    ],
    providers: [ provideServerRendering() ],
  },
)
export class ProjectServerModule {
}
