import { Component, inject, Input, OnInit } from "@angular/core";
import { Meta }                             from "@angular/platform-browser";


@Component({
  selector:    "website-route",
  standalone:  true,
  styleUrls:   [
    "./RouteComponent.sass",
  ],
  templateUrl: "./RouteComponent.html",
})
export class RouteComponent implements OnInit {

  @Input({
    required: true,
  }) private readonly description!: string;

  private readonly meta: Meta = inject<Meta>(Meta);

  ngOnInit(): void {
    this
      .meta
      .updateTag(
        {
          "name":    "description",
          "content": this.description,
        },
      );
  }

}
