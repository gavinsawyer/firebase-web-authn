import { NgModule }             from "@angular/core";
import { ServerModule }         from "@angular/platform-server";
import { RootComponent }        from "../../components";
import { WebsiteBrowserModule } from "../../modules";


@NgModule({
  imports:   [
    WebsiteBrowserModule,
    ServerModule,
  ],
  bootstrap: [
    RootComponent,
  ],
  providers: [],
})
export class WebsiteServerModule {
}
