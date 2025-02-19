export class ResultError extends Error {
  /** 响应对象 */
  constructor(private type: Readonly<ResultErrorType>, message?: string) {
    super(message);
  }
}

export enum ResultErrorType {
  NetworkError = "NetworkError",
  TimeoutError = "TimeoutError",
  AbortError = "AbortError",
  /** 状态码验证错误 */
  StatusValidateError = "StatusValidateError",
}
