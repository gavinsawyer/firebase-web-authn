import { CommonModule }             from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { Meta }                     from "@angular/platform-browser";


@Component({
  imports:     [
    CommonModule,
  ],
  selector:    "website-home-route",
  standalone:  true,
  styleUrls:   [
    "./HomeRouteComponent.sass",
  ],
  templateUrl: "./HomeRouteComponent.html",
})
export class HomeRouteComponent implements OnInit {

  @Input({
    required: true,
  }) private readonly description!: string;

  constructor(
    private readonly meta: Meta,
  ) {
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
