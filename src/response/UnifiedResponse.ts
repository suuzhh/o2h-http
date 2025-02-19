// 基于MDN Response规范扩展的通用响应对象
export class UnifiedResponse<T = any> extends Response {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  readonly timestamp: number;
  readonly config: RequestInit;

  constructor(
    init: ResponseInit & {
      config: RequestInit;
      success: boolean;
      data?: T;
      error?: {
        code: string;
        message: string;
        details?: unknown;
      };
    },
    body?: BodyInit | null
  ) {
    super(body, init);
    this.success = init.success;
    this.data = init.data;
    this.error = init.error;
    this.timestamp = Date.now();
    this.config = init.config;
  }

  // 保持与原生Response的兼容性
  static async from(response: Response, config: RequestInit): Promise<UnifiedResponse> {
    const data = await response.json().catch(() => null);
    const success = response.ok;

    return new UnifiedResponse({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      success,
      data: success ? data : undefined,
      error: success ? undefined : {
        code: `HTTP_${response.status}`,
        message: response.statusText,
        details: data
      },
      config
    });
  }

  // 快捷方法
  getStatusCode(): number {
    return this.status;
  }

  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    for (const entry of this.headers.entries()) {
      headers[entry[0]] = entry[1];
    }
    return headers;
  }

  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }
}
