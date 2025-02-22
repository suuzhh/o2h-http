export class ResultError extends Error {
  /** 响应对象 */
  constructor(
    public readonly type: Readonly<ResultErrorType>,
    message?: string
  ) {
    super(message);
  }
}

export enum ResultErrorType {
  NetworkError = "NetworkError",
  TimeoutError = "TimeoutError",
  AbortError = "AbortError",
  /** 状态码验证错误 */
  StatusValidateError = "StatusValidateError",
  /** 拦截器执行错误 */
  InterceptorError = "InterceptorError"
}
