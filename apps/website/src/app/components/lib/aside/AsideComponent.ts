import { NgIf }                                  from "@angular/common";
import { Component, inject }                     from "@angular/core";
import { AuthenticationService, ProfileService } from "../../../services";
import { ProfileCardComponent }                  from "../profile card/ProfileCardComponent";
import { SignInCardComponent }                   from "../sign in card/SignInCardComponent";


@Component({
  imports: [
    NgIf,
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

  public readonly authenticationService: AuthenticationService = inject<AuthenticationService>(AuthenticationService);
  public readonly profileService:        ProfileService        = inject<ProfileService>(ProfileService);

}
