// 基于MDN Response规范扩展的通用响应对象
export class HttpResponse extends Response {
  private _parsedBody?: any;
  private _headers: Headers;
  private _status: number;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);
    this._headers = new Headers(init?.headers);
    this._status = init?.status || 200;
  }

  // 增强类型定义
  get headers(): Headers {
    return this._headers;
  }

  get status(): number {
    return this._status;
  }

  set status(code: number) {
    this._status = code;
  }

  // 集成数据解析功能
  async parse<T = any>(
    parser?: (response: Response) => Promise<T>
  ): Promise<T> {
    if (this._parsedBody) return this._parsedBody;

    const contentType = this.headers.get("content-type") || "";
    const parserToUse = parser || this.getDefaultParser(contentType);

    this._parsedBody = await parserToUse(this);
    return this._parsedBody;
  }

  private getDefaultParser(
    contentType: string
  ): (response: Response) => Promise<any> {
    if (contentType.includes("application/json")) {
      return (r) => r.json();
    }
    if (contentType.includes("text/")) {
      return (r) => r.text();
    }
    if (contentType.includes("octet-stream")) {
      return (r) => r.arrayBuffer();
    }
    return (r) => r.blob();
  }

  // 添加便捷方法
  async json<T = any>(): Promise<T> {
    if (this._parsedBody) return this._parsedBody;

    // 调用父类的同名方法
    this._parsedBody = await super.json();
    return this._parsedBody;
  }

  async text(): Promise<string> {
    // 调用父类的同名方法 并缓存结果
    if (this._parsedBody) return this._parsedBody;

    this._parsedBody = await super.text();
    return this._parsedBody;
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    if (this._parsedBody) return this._parsedBody;

    this._parsedBody = await super.arrayBuffer();
    return this._parsedBody;
  }

  async blob(): Promise<Blob> {
    if (this._parsedBody) return this._parsedBody;
    this._parsedBody = await super.blob();
    return this._parsedBody;
  }

  async formData(): Promise<FormData> {
    if (this._parsedBody) return this._parsedBody;
    this._parsedBody = await super.formData();
    return this._parsedBody;
  }

  clone(): HttpResponse {
    return new HttpResponse(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
    });
  }

  // 创建响应对象的工厂方法
  static createFromResponse(response: Response): HttpResponse {
    return new HttpResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }
}
