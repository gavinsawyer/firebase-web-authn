import { Component }      from "@angular/core";
import { GitInfo }        from "git-describe";
import { gitInfo }        from "../git-info";
import { packageVersion } from "../package-version";


@Component({
  selector: "website-app-root",
  styleUrls: [
    "./app.component.sass"
  ],
  templateUrl: "./app.component.html",
})
export class AppComponent {

  public readonly gitInfo: Partial<GitInfo> = gitInfo;
  public readonly packageVersion: string = packageVersion;

}
