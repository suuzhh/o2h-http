// 实现angular的请求拦截器和响应拦截器

import type { CommonConfig, HttpResult, IHttpBackend } from "@/backend/base";
import { ResultError, ResultErrorType } from "@/backend/internal-error";
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

export class HttpInterceptorHandler {
  constructor(
    private interceptors: HttpInterceptorFn[],
    private backend: IHttpBackend
  ) { }

  /**
   * 执行拦截器
   *
   * @param initReq
   * @param commonConfig
   * @returns
   */
  async handle(
    initReq: HttpRequest,
    commonConfig: CommonConfig
  ): Promise<HttpResult> {
    try {
      let baseHandlerHasBeenCalled = false;
      let lastResult: HttpResult | undefined;
      // 创建基础处理器
      const baseHandler: HttpHandlerFn = async (req) => {
        const res = await this.backend.doRequest(req, commonConfig);
        baseHandlerHasBeenCalled = true;

        // 如果是第一个拦截器， 则将结果保存到lastResult中
        if (!lastResult) {
          lastResult = res;
        }
        return res;
      };

      // 构建拦截器链
      const chain = this.interceptors.reduceRight<HttpHandlerFn>(
        (next, interceptor) => {
          return async (req) => {
            try {
              // 如果第一个拦截器中在调用next方法后直接抛出异常，也无法获取到next方法的结果
              const result = await interceptor(req, next);
              // 检查拦截器返回结果
              // 如果用户配置的拦截器没有返回，则使用上一次的成功结果，最终回退到默认请求的结果
              const isResultOk = checkInterceptorResult(result);

              if (isResultOk) {
                lastResult = result;
                return result;
              } else {
                if (baseHandlerHasBeenCalled) {
                  console.warn(
                    "Can't receive interceptor result, fallback to previous result."
                  );
                } else {
                  // 如果拦截器中未调用 next 方法
                  console.warn("The second argument of interceptor function must be call.");
                }

                // fallback to previous result
                return (
                  lastResult ?? {
                    response: null,
                    error: new ResultError(
                      ResultErrorType.InterceptorError,
                      "Interceptor not have a valid result"
                    ),
                  }
                );
              }
            } catch (error) {
              // 拦截器错误处理
              return {
                response: lastResult?.response ?? null,
                error: new ResultError(
                  ResultErrorType.InterceptorError,
                  error instanceof Error ? error.message : "Interceptor error"
                ),
              };
            }
          };
        },
        baseHandler
      );

      // 执行拦截器链
      return await chain(initReq);
    } catch (error) {
      // 全局错误处理, 是否需要处理这个情况？
      return {
        response: null,
        error: new ResultError(
          ResultErrorType.InterceptorError,
          error instanceof Error ? error.message : "Request failed"
        ),
      };
    }
  }

  /**
   * 动态添加拦截器的方法
   * 根据加入的先后顺序，执行拦截器
   * request before: 先进先出
   * response after: 后进先出
   *  */
  addInterceptor(interceptor: HttpInterceptorFn): void {
    this.interceptors.push(interceptor);
  }
}

/**
 * 检查拦截器的返回结果是否符合预期
 *
 * 主要是判断用户有没有设置正确的拦截器返回值
 * @param result
 * @returns
 */
function checkInterceptorResult(result?: Readonly<HttpResult>): boolean {
  if (!result) {
    return false;
  }

  return true;
}
