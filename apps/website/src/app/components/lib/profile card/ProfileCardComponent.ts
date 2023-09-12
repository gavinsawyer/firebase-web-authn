import { NgIf }                                  from "@angular/common";
import { Component, inject }                     from "@angular/core";
import { MatButtonModule }                       from "@angular/material/button";
import { MatCardModule }                         from "@angular/material/card";
import { MatIconModule }                         from "@angular/material/icon";
import { AuthenticationService, ProfileService } from "../../../services";


@Component({
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    NgIf,
  ],
  selector:    "website-profile-card",
  standalone:  true,
  styleUrls:   [
    "./ProfileCardComponent.sass",
  ],
  templateUrl: "./ProfileCardComponent.html",
})
export class ProfileCardComponent {

  public readonly authenticationService: AuthenticationService = inject<AuthenticationService>(AuthenticationService);
  public readonly profileService:        ProfileService        = inject<ProfileService>(ProfileService);

}
