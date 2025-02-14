import { IResponseParser, ParseResult } from "./IResponseParser";
export type { IResponseParser };
export { BlobParser } from "./BlobParser";

export class JSONParser implements IResponseParser {
  /**
   * 解析 JSON 数据
   * @param data JSON 字符串
   * @returns 一个 ParseResult 对象，result 是解析后的数据，error 是解析时的错误
   */
  async parse<T>(response: globalThis.Response): Promise<ParseResult<T>> {
    const rawText = await response.text();
    try {
      const result: T = JSON.parse(rawText);
      return { result, isSuccess: true };
    } catch (err) {
      // 有一种场景 post请求没有返回值， 不能算失败
      if (rawText.trim() === "") {
        console.warn("post request without response");
        return { isSuccess: true, result: undefined as T };
      }

      const error =
        err instanceof Error
          ? err
          : new Error("parse response data to json error");
      return { error: { cause: error }, isSuccess: false };
    }
  }
}
