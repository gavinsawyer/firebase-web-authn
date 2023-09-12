import { Route } from "@angular/router";


export const routes: Route[] = [
  {
    loadComponent: () => import("./lib/home/HomeRouteComponent").then(
      (module) => module.HomeRouteComponent,
    ),
    path:          "",
    pathMatch:     "full",
    title:         "FirebaseWebAuthn",
    data:          {
      description: "FirebaseWebAuthn is a Firebase Extension for authentication with WebAuthn passkeys.",
    },
  },
  {
    loadComponent: () => import("./lib/privacy/PrivacyRouteComponent").then(
      (module) => module.PrivacyRouteComponent,
    ),
    path:          "privacy",
    title:         "FirebaseWebAuthn | Privacy",
    data:          {
      description: "This site uses in-browser storage functionality as well as analytics. This page outlines privacy considerations relevant to accessing the site.",
    },
  },
  {
    loadComponent: () => import("./lib/otherwise/OtherwiseRouteComponent").then(
      (module) => module.OtherwiseRouteComponent,
    ),
    path:          "**",
    title:         "FirebaseWebAuthn | Page not found",
    data:          {
      description: "This page was not found.",
    },
  },
];
