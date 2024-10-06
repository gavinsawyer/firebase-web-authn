import { FunctionRequest, FunctionResponse } from "@firebase-web-authn/types";
import { CallableFunction } from "firebase-functions/v2/https";
export declare const api: CallableFunction<FunctionRequest, Promise<FunctionResponse>>;
