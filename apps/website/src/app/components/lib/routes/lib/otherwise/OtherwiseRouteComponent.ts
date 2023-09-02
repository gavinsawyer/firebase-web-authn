import { CommonModule, isPlatformBrowser }                         from "@angular/common";
import { Component, Inject, Input, OnInit, Optional, PLATFORM_ID } from "@angular/core";
import { Meta }                                                    from "@angular/platform-browser";
import { RESPONSE }                                                from "@nguniversal/express-engine/tokens";
import { Response }                                                from "express";
import { PathService }                                             from "../../../../../services";


@Component({
  imports:     [
    CommonModule,
  ],
  selector:    "website-otherwise-route",
  standalone:  true,
  styleUrls:   [
    "./OtherwiseRouteComponent.sass",
  ],
  templateUrl: "./OtherwiseRouteComponent.html",
})
export class OtherwiseRouteComponent implements OnInit {

  @Input({
    required: true,
  }) private readonly description!: string;

  constructor(
                @Inject(PLATFORM_ID) private readonly platformId: object,
    @Optional() @Inject(RESPONSE)    private readonly response:   Response,

    private readonly meta: Meta,

    public readonly pathService: PathService,
  ) {
    isPlatformBrowser(this.platformId) || this
      .response
      .status(404);
  }

  ngOnInit(): void {
    this
      .meta
      .updateTag(
        {
          "name": "description",
          "content": this.description,
        },
      );
  }

}
