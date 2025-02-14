import { IResponseParser, ParseResult } from "./IResponseParser";

export class BlobParser implements IResponseParser {
  async parse<T = Blob>(
    response: globalThis.Response
  ): Promise<ParseResult<T>> {
    try {
      const blob = await response.blob();

      return { isSuccess: true, result: blob as unknown as T };
    } catch (err) {
      console.error(err);
      // 解析失败
      return {
        error: {
          cause: err instanceof Error ? err : new Error("parse blob error"),
        },
        isSuccess: false,
      };
    }
  }
}
