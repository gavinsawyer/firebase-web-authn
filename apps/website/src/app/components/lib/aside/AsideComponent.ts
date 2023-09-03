import { CommonModule }                          from "@angular/common";
import { Component }                             from "@angular/core";
import { AuthenticationService, ProfileService } from "../../../services";
import { ProfileCardComponent }                  from "../profile card/ProfileCardComponent";
import { SignInCardComponent }                   from "../sign in card/SignInCardComponent";


@Component({
  imports:     [
    CommonModule,
    ProfileCardComponent,
    SignInCardComponent,
  ],
  selector:    "website-aside",
  standalone:  true,
  styleUrls:   [
    "./AsideComponent.sass",
  ],
  templateUrl: "./AsideComponent.html",
})
export class AsideComponent {

  constructor(
    public readonly authenticationService: AuthenticationService,
    public readonly profileService:        ProfileService,
  ) {
  }

}
