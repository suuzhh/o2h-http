type SuccessResult<T> = {
  /** 解析是否成功 */
  isSuccess: true;
  result: T;
  error?: never;
};

type ErrorResult = {
  isSuccess: false;
  result?: never;
  /**
   * 解析错误 需要统一为对象结构
   * 使用原生error有一定局限性， 需要更加定制化的实现错误
   */
  error: {
    /** 原始错误 */
    cause: Error;
  };
};

export type ParseResult<T = string> = SuccessResult<T> | ErrorResult;

/**
 * 数据解析器的接口
 *
 * 外部可自行通过该接口自行实现需要的解析器
 */
export interface IResponseParser {
  parse<T = string>(
    response: globalThis.Response
  ): ParseResult<T> | Promise<ParseResult<T>>;
}
