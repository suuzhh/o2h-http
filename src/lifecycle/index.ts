import { safeAssignment } from "@/utils";
import type { IHTTPRequestConfig } from "@/client-adaptor/request";

export interface Lifecycle {
  beforeRequest: (req: IHTTPRequestConfig) => Promise<IHTTPRequestConfig> | IHTTPRequestConfig | undefined;

  /**
   * 在响应状态未通过校验时触发
   *
   * 可通过 validateStatus 来自定义校验规则
   */
  onResponseStatusError: (res: globalThis.Response) => Promise<Error> | Error | undefined;
}

interface LifecycleResult<T> {
  result?: T;
  error?: Error;
}

export type LifecycleConfig = Partial<Lifecycle>;

/**
 * implements all Http Lifecycle
 */
export class LifecycleCaller {
  /**
   * lifecycle method only defined singlely
   */
  private __lifecycle__: Partial<Lifecycle> = {};


  async call<T extends keyof Lifecycle>(
    name: T,
    ...args: Parameters<Lifecycle[T]>
  ): Promise<LifecycleResult<Awaited<ReturnType<Lifecycle[T]>>>> {
    const method = this.__lifecycle__[name];

    if (!method) {
      return { result: undefined };
    }

    // Must define specific lifecycle method function type,
    // otherwise type checking will fail
    type LifecycleFn = (..._args: Parameters<Lifecycle[T]>) => Awaited<ReturnType<Lifecycle[T]>>;

    const fn = method as unknown as LifecycleFn;

    const [error, result] = await safeAssignment<Awaited<ReturnType<Lifecycle[T]>>>(() => fn(...args));

    if (result) {
      return {
        result
      };
    }

    return {
      error: error ?? new Error("lifecycle error")
    };
  }

  beforeRequest = (fn: Lifecycle["beforeRequest"]) => {
    this.__lifecycle__.beforeRequest = fn;
  };


  onResponseStatusError = (fn: Lifecycle["onResponseStatusError"]) => {
    this.__lifecycle__.onResponseStatusError = fn;
  };
}
