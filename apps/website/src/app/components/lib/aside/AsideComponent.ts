import { NgIf }                  from "@angular/common";
import { Component, inject }     from "@angular/core";
import { MatIconModule }         from "@angular/material/icon";
import { AuthenticationService } from "../../../services";
import { SignedInComponent }     from "../signed in/SignedInComponent";
import { SignedOutComponent }    from "../signed out/SignedOutComponent";


@Component({
  imports:     [
    MatIconModule,
    NgIf,
    SignedInComponent,
    SignedOutComponent,
  ],
  selector:    "website-aside",
  standalone:  true,
  styleUrls:   [
    "./AsideComponent.sass",
  ],
  templateUrl: "./AsideComponent.html",
})
export class AsideComponent {

  public readonly authenticationService: AuthenticationService = inject<AuthenticationService>(AuthenticationService);

}
