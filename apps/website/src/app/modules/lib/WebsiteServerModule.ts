import { NgModule }                             from "@angular/core";
import { provideServerRendering, ServerModule } from "@angular/platform-server";
import { RootComponent }                        from "../../components";
import { WebsiteBrowserModule }                 from "../../modules";


@NgModule({
  bootstrap: [
    RootComponent,
  ],
  imports:   [
    WebsiteBrowserModule,
    ServerModule,
  ],
  providers: [
    provideServerRendering(),
  ],
})
export class WebsiteServerModule {
}
