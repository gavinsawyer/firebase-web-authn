import { CommonModule } from "@angular/common";
import { Component }    from "@angular/core";


@Component({
  imports:     [
    CommonModule,
  ],
  selector:    "website-app-home",
  standalone:  true,
  styleUrls:   [
    "./home.route.component.sass",
  ],
  templateUrl: "./home.route.component.html",
})
export class HomeRouteComponent {
}
