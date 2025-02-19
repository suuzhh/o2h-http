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

export interface HttpInterceptorConfig {
  request?: HttpInterceptorFn[];
  response?: HttpInterceptorFn[];
}

export class HttpInterceptorHandler {
  private static config: HttpInterceptorConfig = {
    request: [],
    response: [],
  };

  constructor(
    private interceptors: HttpInterceptorFn[],
    private backend: IHttpClientAdaptor
  ) {}

  static configure(callback: (config: HttpInterceptorConfig) => void) {
    callback(this.config);
    return this;
  }

  handle<R>(
    initReq: IHTTPRequestConfig
  ): globalThis.Response | Promise<globalThis.Response> {
    // 合并全局配置的拦截器和实例拦截器
    const allInterceptors = [
      ...(HttpInterceptorHandler.config.request || []),
      ...this.interceptors,
      ...(HttpInterceptorHandler.config.response || []).reverse(),
    ];

    const endFn = (
      initialRequest: IHTTPRequestConfig,
      finalHandlerFn: HttpHandlerFn
    ) => finalHandlerFn(initialRequest);

    const chain = allInterceptors.reduceRight((next, interceptorFn) => {
      return (req: IHTTPRequestConfig, lastNext: HttpHandlerFn) => {
        return interceptorFn(req, (modifiedReq) => next(modifiedReq, lastNext));
      };
    }, endFn);

    return chain(initReq, (lastReq: IHTTPRequestConfig) => {
      // 执行最后一个操作
      return this.backend.doRequest<R>(lastReq);
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
