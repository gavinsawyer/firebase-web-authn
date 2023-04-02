import { CommonModule }          from "@angular/common";
import { Component }                             from "@angular/core";
import { AuthenticationService, ProfileService } from "../../services";
import { ProfileCardComponent }                  from "../profile-card";
import { SignInCardComponent }   from "../sign-in-card";


@Component({
  imports: [
    CommonModule,
    ProfileCardComponent,
    SignInCardComponent,
  ],
  selector: "demo-app-home",
  standalone: true,
  styleUrls: [
    "./home.component.sass",
  ],
  templateUrl: "./home.component.html",
})
export class HomeComponent {

  constructor(
    public readonly authenticationService: AuthenticationService,
    public readonly profileService: ProfileService,
  ) {}

}
