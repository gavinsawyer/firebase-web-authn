import { NgModule }         from "@angular/core";
import { ServerModule }     from "@angular/platform-server";
import { RootComponent }    from "../../components";
import { AppBrowserModule } from "./app.browser.module";


@NgModule({
  imports:   [
    AppBrowserModule,
    ServerModule,
  ],
  bootstrap: [
    RootComponent,
  ],
  providers: [],
})
export class AppServerModule {
}
