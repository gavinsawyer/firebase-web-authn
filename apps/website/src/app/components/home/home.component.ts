import { CommonModule }         from "@angular/common";
import { Component }            from "@angular/core";
import { ProfileCardComponent } from "../profile-card";
import { SignInCardComponent }  from "../sign-in-card";


@Component({
  imports: [
    CommonModule,
    ProfileCardComponent,
    SignInCardComponent,
  ],
  selector: "website-app-home",
  standalone: true,
  styleUrls: [
    "./home.component.sass",
  ],
  templateUrl: "./home.component.html",
})
export class HomeComponent { }
