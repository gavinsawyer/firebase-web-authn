import { CommonModule }                          from "@angular/common";
import { Component }                             from "@angular/core";
import { AuthenticationService, ProfileService } from "../../../services";
import { ProfileCardComponent }                  from "../profile-card/profile-card.component";
import { SignInCardComponent }                   from "../sign-in-card/sign-in-card.component";


@Component({
  imports:     [
    CommonModule,
    ProfileCardComponent,
    SignInCardComponent,
  ],
  selector:    "website-app-aside",
  standalone:  true,
  styleUrls:   [
    "./aside.component.sass",
  ],
  templateUrl: "./aside.component.html",
})
export class AsideComponent {

  constructor(
    public readonly authenticationService: AuthenticationService,
    public readonly profileService:        ProfileService,
  ) {
  }

}
