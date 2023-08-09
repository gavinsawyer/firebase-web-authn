import { Component, Inject }         from "@angular/core";
import { GitInfo }                   from "git-describe";
import { GIT_INFO, PACKAGE_VERSION } from "../../../injection-tokens";


@Component({
  selector:    "website-app-root",
  styleUrls:   [
    "./root.component.sass",
  ],
  templateUrl: "./root.component.html",
})
export class RootComponent {

  constructor(
    @Inject(GIT_INFO)        public readonly gitInfo:        Partial<GitInfo>,
    @Inject(PACKAGE_VERSION) public readonly packageVersion: string,
  ) {
  }

}
