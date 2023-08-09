import { enableProdMode } from "@angular/core";
import { environment }    from "./environment";


environment
  .production && enableProdMode();

export { AppServerModule } from "./app/modules";
