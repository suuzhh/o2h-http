// 实现angular的请求拦截器和响应拦截器

import type { CommonConfig, HttpResult, IHttpBackend } from "@/backend/base";
import { HttpRequest } from "@/request/HttpRequest";

export type HttpHandlerFn = (
  /** 请求配置， 由于配置对象可被修改， 可能存在配置被误删除的情况，需要使用对象现在配置的修改   */
  req: HttpRequest
) => Promise<HttpResult>;
/**
 * 请求拦截器类型
 * @public
 */
export type HttpInterceptorFn = (
  req: HttpRequest,
  next: HttpHandlerFn
) => Promise<HttpResult>;

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
    private backend: IHttpBackend
  ) {}

  static configure(callback: (config: HttpInterceptorConfig) => void) {
    callback(this.config);
    return this;
  }

  handle(
    initReq: HttpRequest,
    commonConfig: CommonConfig
  ): Promise<HttpResult> {
    // 合并全局配置的拦截器和实例拦截器
    const allInterceptors = [
      ...(HttpInterceptorHandler.config.request || []),
      ...this.interceptors,
      ...(HttpInterceptorHandler.config.response || []).reverse(),
    ];

    const endFn = (
      initialRequest: HttpRequest,
      finalHandlerFn: HttpHandlerFn
    ) => finalHandlerFn(initialRequest);

    const chain = allInterceptors.reduceRight((next, interceptorFn) => {
      return (req: HttpRequest, lastNext: HttpHandlerFn) => {
        return interceptorFn(req, (modifiedReq) => next(modifiedReq, lastNext));
      };
    }, endFn);

    return chain(initReq, (lastReq: HttpRequest) => {
      // 执行最后一个操作
      return this.backend.doRequest(lastReq, commonConfig);
    });
  }
}
