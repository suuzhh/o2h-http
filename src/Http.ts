import {
  normalizeRequestConfig,
  type RequestConfig,
} from "@/client-adaptor/request";
import { FetchClient } from "./client-adaptor/fetch";
import { JSONParser, IResponseParser } from "./parser";
import { LifecycleCaller } from "./lifecycle";
import type { IResult } from "./utils";
import { IHttpClientAdaptor } from "./client-adaptor/base";

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

  // 请求客户端适配器
  readonly fetchClient: IHttpClientAdaptor;

  constructor(private responseParser: IResponseParser = new JSONParser()) {
    this.fetchClient = new FetchClient(responseParser, this.lifecycle);
  }

  post<R = unknown, P = unknown>(
    url: string,
    data?: P,
    config?: RequestConfig
  ) {
    const headers = new Headers();
    let body: globalThis.BodyInit | undefined = undefined;
    // TODO: body类型转换是否需要转到client-adaptor层
    if (data instanceof FormData) {
      // 针对表单的设置
      // header 不需要自己设置成multipart/form-data，
      // 让浏览器自己添加，否则识别不到文件
      body = data;
      // } else if (data instanceof ReadableStream) {
      //   body = data;
      //   headers.set("Content-Type", "application/octet-stream");
    } else {
      body = JSON.stringify(data);
      headers.set("Content-Type", "application/json");
    }

    const requestConfig = normalizeRequestConfig({
      ...config,
      url,
      method: "POST",
      body,
      headers,
    });

    return this.fetchClient.fetch<R>(requestConfig);
  }

  get<R = Record<string, string>, P = Record<string, string | number> | string>(
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

    const requestConfig = normalizeRequestConfig({
      ...actionConfig,
      url,
      method: "GET",
    });

    return this.fetchClient.fetch<R>(requestConfig);
  }
}

export interface HttpClientOptions {}
