import { HttpRequest } from "@/request/HttpRequest";
import { HttpResponse } from "@/response/HttpResponse";
import { timeout as timeoutWrapper } from "./timeout";
import type { CommonConfig, HttpResult, IHttpBackend } from "../base";
import { ResultError, ResultErrorType } from "../internal-error";

/**
 * 默认头覆盖机制
 *  当创建 new Request() 时，如果显式设置 headers 参数：
 * new Request(url, { headers: new Headers() })
 * 这会清除浏览器自动添加的默认头，包括：
  * - Accept 
  * - Accept-Language
  * - User-Agent
  * - Content-Type (当有请求体时)
**/

function createRequestInit(request: HttpRequest) {
  // 先创建默认Request实例
  const defaultRequest = new Request(request.url);
  const headers = new Headers(defaultRequest.headers);

  // 合并用户自定义头（保留用户设置优先级）
  const userHeaders = request.headers;
  userHeaders.forEach((value, name) => {
    headers.set(name, value);
  });

  if (request.body instanceof FormData) {
    headers.delete("Content-Type");
  }

  let body: BodyInit | undefined = undefined;
  // 如果content-type为multipart/form-data，则将body转换为FormData
  if (
    request.headers.get("Content-Type")?.includes("multipart/form-data")
  ) {
    body = request._originalConfig.body as FormData;
  } else {
    // 其它类型暂时转为字符串
    body = request.readBodyAsString();
  }
  return new Request(request.url, {
    method: request.method,
    headers: request.headers,
    // 如果body类型为ReadableStream，则默认的headers将被消失
    // 如果需要浏览器自动带上特定的header, 不要将body设置为此类型
    body: body,
    // @ts-ignore - Temporary ignore for duplex type
    duplex: body instanceof ReadableStream ? "half" : undefined,
    credentials: request.credentials,
    mode: request.mode,
    cache: request.cache,
    redirect: request.redirect,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    integrity: request.integrity,
    keepalive: request.keepalive,
    signal: request.signal,
  });
}

export class FetchBackend implements IHttpBackend {
  async doRequest(
    request: HttpRequest,
    config: Readonly<CommonConfig>
  ): Promise<HttpResult> {
    let response: Response;
    const { timeout, validateStatus } = config;

    try {
      const requestInit = createRequestInit(request);
      response = await timeoutWrapper(timeout * 1000, fetch(requestInit));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return {
          response: null,
          error: new ResultError(ResultErrorType.AbortError, err.message),
        };
      }
      if (err instanceof Error && err.name === "TimeoutError") {
        return {
          response: null,
          error: new ResultError(ResultErrorType.TimeoutError, err.message),
        };
      }

      // 处理各种类型的请求错误
      let errorMessage = "Request Error";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      return {
        response: null,
        error: new ResultError(ResultErrorType.RequestError, errorMessage),
      };
    }

    const isOK = validateStatus(response.status);
    if (!isOK) {
      return {
        response: HttpResponse.createFromResponse(response),
        error: new ResultError(ResultErrorType.StatusValidateError),
      };
    }

    return {
      response: HttpResponse.createFromResponse(response),
      error: null,
    };
  }
}
