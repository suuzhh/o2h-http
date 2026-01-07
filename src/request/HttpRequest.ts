/**
 * 内部使用的请求配置
 * 用到哪些再实现，不要一次性扩展太多
 * */
export interface INTERNAL_RequestConfig {
  url: URL;
  method: "GET" | "POST";
  headers: Headers;
  body?: Body["body"] | FormData | string;
  signal?: AbortSignal | null;
  /** 跨域请求时是否携带凭证 */
  credentials: RequestCredentials;
}

/**
 * @public
 */
export class HttpRequest extends Request {
  // 原始配置 用于测试
  readonly _originalConfig: INTERNAL_RequestConfig;

  constructor(config: INTERNAL_RequestConfig) {
    // 如果设置了body，且method是GET，body将被忽略
    const hasBody = !(config.body && config.method === "GET");
    // 跨域请求时是否携带凭证
    config.credentials = config.credentials || "omit";

    if (hasBody) {
      // 为了兼容NODEJS ReadableStream
      // https://github.com/nodejs/node/issues/46221
      // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
      (config as { duplex?: "half" }).duplex = "half";
    } else {
      config.body = undefined;
    }

    super(config.url, config);

    this._originalConfig = { ...config };
  }

  clone(): HttpRequest {
    return new HttpRequest({
      url: new URL(this.url),
      method: this.method as INTERNAL_RequestConfig["method"],
      headers: this.headers,
      body: this.body,
      signal: this.signal,
      credentials: this.credentials,
    });
  }

  /**
   * 读取request的请求体
   * 注意：如果请求体是ReadableStream类型，该方法将返回undefined
   * @returns 
   */
  private _readBodyAsString(): string | undefined {
    if (this.method === "GET" || this.method === "HEAD") {
      return undefined;
    }
    if (typeof this._originalConfig.body === "string") {
      return this._originalConfig.body;
    }

    return undefined;
  }

  /**
   * 根据content-type读取request body
   * @returns {BodyInit | undefined}
   */
  readBodyByType(): BodyInit | undefined {
    if (
      this.headers.get("Content-Type")?.includes("multipart/form-data")
    ) {
      return this._originalConfig.body as FormData;
    } else {
      // TODO: ReadableStream 类型的请求体读取未实现
      // 其它类型暂时转为字符串
      return this._readBodyAsString();
    }
  }

}
