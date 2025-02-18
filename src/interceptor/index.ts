// 实现angular的请求拦截器和响应拦截器

import { IHttpClientAdaptor } from "@/client-adaptor/base";
import { IHTTPRequestConfig } from "@/client-adaptor/request";

/**
 * 请求拦截器类型
 * @public
 */
export type HttpHandlerFn = (
  /** 请求配置， 由于配置对象可被修改， 可能存在配置被误删除的情况，需要使用对象现在配置的修改   */
  req: IHTTPRequestConfig
) => globalThis.Response | Promise<globalThis.Response>;

export type HttpInterceptorFn = (
  req: IHTTPRequestConfig,
  next: HttpHandlerFn
) => globalThis.Response | Promise<globalThis.Response>;

export class HttpInterceptorHandler {
  constructor(
    private interceptors: HttpInterceptorFn[],
    private backend: IHttpClientAdaptor
  ) {}

  handle<R>(
    initReq: IHTTPRequestConfig
  ): globalThis.Response | Promise<globalThis.Response> {
    const endFn = (initialRequest, finalHandlerFn) =>
      finalHandlerFn(initialRequest);

    const chain = this.interceptors.reduceRight((next, interceptorFn) => {
      return (req: IHTTPRequestConfig, lastNext) => {
        return interceptorFn(req, (r) => {
          return next(r, lastNext);
        });
      };
    }, endFn);

    return chain(initReq, (lastReq: IHTTPRequestConfig) => {
      // 执行最后一个操作
      return this.backend.fetch<R>(lastReq);
    });
  }
}

// export function withInterceptors(interceptors: HttpInterceptorFn[]) {
//   const runInterceptors = (firstHandler: HttpInterceptorHandler) => {
//     // 如果interceptors为空，直接返回firstHandler
//     if (interceptors.length === 0) return firstHandler;
//     return interceptors.reduceRight(
//       (next, interceptor) => new HttpInterceptorHandler(next, interceptor),
//       firstHandler.handle
//     );
//   };

//   return runInterceptors;
// }
