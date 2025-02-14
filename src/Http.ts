import { request } from "./core";
import { normalizeRequestConfig, RequestConfig } from "./config/request";
import { JSONParser, IResponseParser } from "./parser";
import { LifecycleCaller } from "./lifecycle";
import type { IResult } from "./utils";

interface IHttpClient {
  post<R = unknown, P = unknown>(
    url: string,
    data?: P,
    config?: RequestConfig
  ): Promise<IResult<R>>;
  get<P = Record<string, string | number>, R = unknown>(
    url: string,
    options?: Omit<RequestConfig, "url" | "method" | "body"> & { query?: P }
  ): Promise<IResult<R>>;

  // 以下待实现
  // put: () => void;
  // delete: () => void;
  // options: () => void;
  // patch: () => void;
  // head: () => void;
  // connect: () => void;
}

export class HttpClient implements IHttpClient {
  // 生命周期处理对象
  readonly lifecycle = new LifecycleCaller();

  constructor(private responseParser: IResponseParser = new JSONParser()) {}

  post<R = unknown, P = unknown>(
    url: string,
    data?: P,
    config?: RequestConfig
  ) {
    const headers = new Headers();
    let body: globalThis.BodyInit | undefined = undefined;
    if (data instanceof FormData) {
      // 针对表单的设置
      // header 不需要自己设置成multipart/form-data，
      // 让浏览器自己添加，否则识别不到文件
      body = data;
    } else if (data instanceof ReadableStream) {
      body = data;
      headers.set("Content-Type", "application/octet-stream");
    } else {
      body = JSON.stringify(data);
      headers.set("Content-Type", "application/json");
    }

    const [requestObj, otherConfig] = normalizeRequestConfig({
      ...config,
      url,
      method: "POST",
      body,
      headers,
    });

    return request<R>(
      requestObj,
      otherConfig,
      this.responseParser,
      this.lifecycle
    );
  }

  get<R = unknown, P = Record<string, string | number> | string>(
    url: string,
    options?: Omit<RequestConfig, "url" | "method" | "body"> & { query?: P }
  ) {
    const { query, ...actionConfig } = options || {};

    if (query) {
      if (typeof query === "string") {
        url += `?${query}`;
      } else {
        const params = new URLSearchParams(query);

        url += `?${params.toString()}`;
      }
    }

    const [requestObj, otherConfig] = normalizeRequestConfig({
      ...actionConfig,
      url,
      method: "GET",
    });

    return request<R>(
      requestObj,
      otherConfig,
      this.responseParser,
      this.lifecycle
    );
  }
}

export interface HttpClientOptions {}
