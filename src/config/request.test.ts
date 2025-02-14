import { describe, expect, test } from "vitest";
import { normalizeRequestConfig } from "./request";

describe("RequestConfig", () => {
  test("url is defined", () => {
    const url = "https://jsonplaceholder.typicode.com/todos/1";

    const [requestObj] = normalizeRequestConfig({
      url,
      method: "GET",
    });
    expect(requestObj.url).toBe(url);
  });

  test("method is defined", () => {
    const method = "GET";

    const [requestObj] = normalizeRequestConfig({
      url: "https://jsonplaceholder.typicode.com/todos/1",
      method,
    });
    expect(requestObj.method).toBe(method);
  });

  test("headers is defined", () => {
    const headers = {
      "Content-Type": "application/json",
    };

    const [requestObj] = normalizeRequestConfig({
      url: "https://jsonplaceholder.typicode.com/todos/1",
      method: "GET",
      headers,
    });
    expect(requestObj.headers.get("Content-Type")).toBe(
      headers["Content-Type"]
    );
  });

  test("body is defined", async () => {
    const body = "test";

    const [requestObj] = normalizeRequestConfig({
      url: "https://jsonplaceholder.typicode.com/todos/1",
      method: "POST",
      body: body,
    });

    if (!requestObj.body) {
      throw new Error("body is undefined");
    }
    const reader = requestObj.body.getReader();
    let resData = "";
    let done = false;
    // 读取body内容
    while (!done) {
      const result = await reader.read();
      // Uint8Array to string
      resData += new TextDecoder("utf-8").decode(result.value);
      done = result.done;
    }
    expect(resData).toBe(body);
  });
});
