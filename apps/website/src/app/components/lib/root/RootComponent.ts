import { Component, inject }         from "@angular/core";
import { GitInfo }                   from "git-describe";
import { GIT_INFO, PACKAGE_VERSION } from "../../../injection tokens";
import { AuthenticationService }     from "../../../services";


@Component({
  selector:    "website-root",
  styleUrls:   [
    "./RootComponent.sass",
  ],
  templateUrl: "./RootComponent.html",
})
export class RootComponent {

  public readonly authenticationService: AuthenticationService = inject<AuthenticationService>(AuthenticationService);
  public readonly gitInfo:               Partial<GitInfo>      = inject<Partial<GitInfo>>(GIT_INFO);
  public readonly packageVersion:        string                = inject<string>(PACKAGE_VERSION);

}
