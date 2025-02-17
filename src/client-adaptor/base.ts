import type { IHTTPRequest } from "./request";
import type { IResponseParser } from '../parser';
import type { LifecycleCaller } from "../lifecycle";
import type { IResult } from "../utils";

export interface IHttpClientAdaptor {
  fetch: <R>(request: IHTTPRequest,
    responseParser: IResponseParser,
    lifecycle: LifecycleCaller
  ) => Promise<IResult<R>>;
}