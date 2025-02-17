import type { OtherConfig } from "./config/other";
import { LifecycleCaller } from "./lifecycle";
import type { IResponseParser } from "./parser";
import { timeout as timeoutWrapper } from "./client-adaptor/fetch/timeout";
import { type IResult, buildSuccessResult, buildFailResult } from "./utils";

export async function request<R>(
  request: globalThis.Request,
  otherConfig: OtherConfig,
  responseParser: IResponseParser,
  lifecycle: LifecycleCaller
): Promise<IResult<R>> {
  let res: Response;

  const beforeRequestResult = await lifecycle.call("beforeRequest", request);

  if (beforeRequestResult.error) {
    return buildFailResult(beforeRequestResult.error);
  }

  if (beforeRequestResult.result) {
    request = beforeRequestResult.result;
  }

  const { validateStatus, timeout } = otherConfig;

  try {
    // 包裹一层 用于 验证是否超时
    res = await timeoutWrapper(timeout * 1000, fetch(request));
  } catch (err) {
    return buildFailResult(
      err instanceof Error ? err : new Error("request error")
    );
  }

  // 通过状态码判断成功与否
  const isOK = validateStatus(res.status);
  // TODO: 状态码为0的情况如何判断类别

  if (isOK) {
    try {
      // headers中的Content-Type设为application/json 才能使用json解析
      // 根据解析逻辑处理成对应类型的数据结构
      const parseResult = await responseParser.parse<R>(res);

      if (parseResult.isSuccess) {
        return buildSuccessResult(parseResult.result);
      } else {
        // TODO: 暂时返回原生错误对象
        return buildFailResult(
          parseResult.error.cause ?? new Error("response parse error")
        );
      }
    } catch (err) {
      return buildFailResult(
        err instanceof Error ? err : new Error("response parse error")
      );
    }
  } else {
    // 处理状态码错误
    const onResponseStatusErrorResult = await lifecycle.call(
      "onResponseStatusError",
      res
    );

    if (
      onResponseStatusErrorResult.result ||
      onResponseStatusErrorResult.error
    ) {
      // 判断是否有返回Error对象
      if (onResponseStatusErrorResult.result instanceof Error) {
        return buildFailResult(onResponseStatusErrorResult.result);
      }

      if (onResponseStatusErrorResult.error instanceof Error) {
        return buildFailResult(onResponseStatusErrorResult.error);
      }

      return buildFailResult(
        new Error(`获取数据失败${res.status ? `, 状态码${res.status}` : ""}`)
      );
    } else {
      return buildFailResult(
        new Error(`获取数据失败${res.status ? `, 状态码${res.status}` : ""}`)
      );
    }
  }
}
