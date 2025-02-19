/**
 * 内部使用的请求配置
 * 用到哪些再实现，不要一次性扩展太多
 * */
export interface INTERNAL_RequestConfig {
  url: URL;
  method: "GET" | "POST";
  headers: Headers;
  body?: Body["body"];
}

export class HttpRequest extends Request {
  constructor(config: INTERNAL_RequestConfig) {
    // 如果设置了body，且method是GET，body将被忽略
    const hasBody = !(config.body && config.method === "GET");

    if (hasBody) {
      // 为了兼容NODEJS ReadableStream
      // https://github.com/nodejs/node/issues/46221
      // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
      (config as { duplex?: "half" }).duplex = "half";
    }
    super(
      config.url,
      hasBody
        ? config
        : {
            ...config,
            body: undefined,
          }
    );
  }

  clone(): HttpRequest {
    return new HttpRequest({
      url: new URL(this.url),
      method: this.method as INTERNAL_RequestConfig["method"],
      headers: this.headers,
      body: this.body
    });
  }


}
