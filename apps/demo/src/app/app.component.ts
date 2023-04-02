import { Component }   from "@angular/core";
import { PathService } from "./services";


@Component({
  selector: "demo-app-root",
  styleUrls: [
    "./app.component.sass"
  ],
  templateUrl: "./app.component.html",
})
export class AppComponent {

  constructor(
    public readonly pathService: PathService,
  ) {}

}
