import { InjectionToken } from "@angular/core";
import { Response }       from "express";


export const RESPONSE: InjectionToken<Response> = new InjectionToken<Response>("RESPONSE");
