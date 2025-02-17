import { describe, expect, test } from "vitest";
import { LifecycleCaller } from "@/lifecycle";
import { normalizeRequestConfig } from '@/client-adaptor/request';

describe("Lifecycle", () => {
  const lifecycle = new LifecycleCaller();
  test("beforeRequest is defined", async () => {
    lifecycle.beforeRequest((req) => {
      req.headers.set("Content-Type", "123");
      return req;
    });

    const res = await lifecycle.call(
      "beforeRequest",
      normalizeRequestConfig({
        url: "https://jsonplaceholder.typicode.com/todos/1",
      })

    );
    const result = res.result;

    expect(result).not.toBeUndefined();
    expect(result!.headers.get("Content-Type")).toBe("123");
    // expect(result!.bodyUsed).toBeFalsy();
  });

  test("onResponseStatusError is defined", async () => {
    lifecycle.onResponseStatusError(() => {
      return new Error("123");
    });

    const res = await lifecycle.call(
      "onResponseStatusError",
      normalizeRequestConfig({ url: 'test' }),
      new Response("123")
    );
    const { result } = res;

    // 该回调的result也是一个错误对象
    expect(result).not.toBeUndefined();
    expect(result!.message).toBe("123");
  });

  test('onResponseStatusError callback first parameter should be request config', async () => {
    let url = '';

    lifecycle.onResponseStatusError((req) => {
      url = req.url;
    });

    const res = await lifecycle.call(
      "onResponseStatusError",
      normalizeRequestConfig({ url: 'test' }),
      new Response("123")
    );
    const { error } = res;

    // 该回调的result也是一个错误对象
    expect(error).not.toBeUndefined();
    expect(url).toBe('test');
  });

  test("onResponseStatusError should catch error", async () => {
    lifecycle.onResponseStatusError(() => {
      throw new Error("456");
    });

    const res = await lifecycle.call(
      "onResponseStatusError",
      normalizeRequestConfig({ url: 'test' }),
      new Response("123")
    );
    const { error } = res;

    // 该回调的result也是一个错误对象
    expect(error).not.toBeUndefined();
    expect(error!.message).toBe("456");
  });
});
