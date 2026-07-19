/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

import { ChangeDetectionStrategy, Component, inject, input, type InputSignal, OnInit } from "@angular/core";
import { Meta }                                                                        from "@angular/platform-browser";


@Component(
  {
    changeDetection: ChangeDetectionStrategy.OnPush,
    template:        "",

    standalone: true,
  },
)
export class RouteComponent
  implements OnInit {

  private readonly meta: Meta = inject<Meta>(Meta);

  public readonly descriptionInput$: InputSignal<string> = input.required<string>({ alias: "description" });

  public ngOnInit(): void {
    this.meta.updateTag(
      {
        name:    "description",
        content: this.descriptionInput$(),
      },
    );
  }

}
