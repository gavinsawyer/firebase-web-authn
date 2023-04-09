import { CommonModule, isPlatformBrowser }          from "@angular/common";
import { Component, Inject, Optional, PLATFORM_ID } from "@angular/core";
import { RESPONSE }                                 from "@nguniversal/express-engine/tokens";
import { Response }                                 from "express"
import { PathService }                              from "../../services";


@Component({
  imports: [
    CommonModule,
  ],
  selector: "website-app-otherwise",
  standalone: true,
  styleUrls: [
    "./otherwise.component.sass",
  ],
  templateUrl: "./otherwise.component.html",
})
export class OtherwiseComponent {

  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId: object,

    @Optional()
    @Inject(RESPONSE)
    private readonly response: Response,

    public readonly pathService: PathService,
  ) {
    isPlatformBrowser(platformId) || response
      .status(404);
  }

}
