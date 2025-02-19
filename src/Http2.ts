import { CommonConfig } from "./backend/base";
import { FetchBackend } from "./backend/fetch";
import { parseResponse } from "./client-adaptor/fetch";
import { RequestConfig } from "./client-adaptor/request";
import type { IHttpClient } from "./Http";
import { JSONParser } from "./parser";
import { HttpRequest } from "./request/HttpRequest";
import { buildFailResult, type IResult } from "./utils";
import { mergeHeaders } from "./utils/mergeHeaders";

export interface UserRequestConfig {}

export class FetchHttpClient implements IHttpClient {
  readonly httpBackend = new FetchBackend();

  readonly responseParser = new JSONParser();

  post<R = unknown, P = unknown>(
    url: string,
    data?: P,
    config?: RequestConfig
  ): Promise<IResult<R>> {
    throw new Error("Method not implemented.");
  }
  async get<P = Record<string, string | number>, R = unknown>(
    url: string,
    options?: Omit<RequestConfig, "url" | "method" | "body"> & { query?: P }
  ): Promise<IResult<R>> {
    if (options?.query) {
      if (typeof options.query === "string") {
        url += `?${options.query}`;
      } else {
        const params = new URLSearchParams(options.query);

        url += `?${params.toString()}`;
      }
    }

    const headers = mergeHeaders(options?.headers);

    const req = new HttpRequest({
      url: new URL(url),
      method: "GET",
      headers,
    });

    const config: CommonConfig = {
      timeout: options?.timeout || 0,
      validateStatus:
        options?.validateStatus || ((status) => status >= 200 && status < 300),
    };

    const { response, error } = await this.httpBackend.doRequest(req, config);

    if (error) {
      return buildFailResult(error);
    }

    // 有响应才算成功
    if (response) {
      // 解析数据

      // TODO: 是否需要使用response.parse替换该方法
      return await parseResponse<R>(response, this.responseParser);
    } else {
      return buildFailResult(new Error("unknown response error"));
    }
  }
}
