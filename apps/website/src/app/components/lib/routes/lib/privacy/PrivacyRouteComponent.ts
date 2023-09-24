import { Component }      from "@angular/core";
import { MatIconModule }  from "@angular/material/icon";
import { RouterLink }     from "@angular/router";
import { RouteComponent } from "../../../../../components";


@Component({
  imports:     [
    MatIconModule,
    RouterLink,
  ],
  selector:    "website-privacy-route",
  standalone:  true,
  templateUrl: "./PrivacyRouteComponent.html",
})
export class PrivacyRouteComponent extends RouteComponent {
}
