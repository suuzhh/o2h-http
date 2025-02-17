import type { IHTTPRequestConfig } from "./request";
import type { IResponseParser } from '../parser';
import type { LifecycleCaller } from "../lifecycle";
import type { IResult } from "../utils";

export interface IHttpClientAdaptor {
  fetch: <R>(request: IHTTPRequestConfig,
    responseParser: IResponseParser,
    lifecycle: LifecycleCaller
  ) => Promise<IResult<R>>;
}