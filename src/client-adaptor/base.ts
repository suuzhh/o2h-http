import type { IHTTPRequestConfig } from "./request";
import type { IResult } from "../utils";

export interface IHttpClientAdaptor {
  doRequest: <R>(request: IHTTPRequestConfig) => Promise<IResult<R>>;
}
