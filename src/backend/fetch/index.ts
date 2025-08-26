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
  const headers = request.headers;

  const body = request.readBodyByType();
  // fetch请求中如果body为FormData类型,会自动生成对应的content-type
  // https://flaviocopes.com/fix-formdata-multipart-fetch/
  // https://philna.sh/blog/2025/01/14/troubles-with-multipart-form-data-fetch-node-js/
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type#content-type_in_multipart_forms
  if (body instanceof FormData) {
    if (headers.has("Content-Type")) {
      // 如果body类型为ReadableStream，则默认的headers将被消失
      console.warn(
        "FetchBackend: Content-Type will be ignored when body is typeof FormData"
      );
      headers.delete("Content-Type");
    }
  }

  return new Request(request.url, {
    method: request.method,
    headers: headers,
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
