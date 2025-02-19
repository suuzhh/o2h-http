import { RequestConfig } from "./client-adaptor/request";
import type { IHttpClient } from "./Http";
import type { IResult } from "./utils";

export interface UserRequestConfig {
  
}

export class FetchHttpClient implements IHttpClient {
  post<R = unknown, P = unknown>(url: string, data?: P, config?: RequestConfig): Promise<IResult<R>> {
    throw new Error("Method not implemented.");
  }
  get<P = Record<string, string | number>, R = unknown>(url: string, options?: Omit<RequestConfig, "url" | "method" | "body"> & { query?: P; }): Promise<IResult<R>> {
    throw new Error("Method not implemented.");
  }

}
