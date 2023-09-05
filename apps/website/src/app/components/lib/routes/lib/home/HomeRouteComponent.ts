import { Component }      from "@angular/core";
import { RouteComponent } from "../../../../../components";


@Component({
  selector:    "website-home-route",
  standalone:  true,
  styleUrls:   [
    "./HomeRouteComponent.sass",
  ],
  templateUrl: "./HomeRouteComponent.html",
})
export class HomeRouteComponent extends RouteComponent {
}
