import { describe, expect, test } from "vitest";
import { normalizeRequestConfig } from "./index";

describe("RequestConfig", () => {
  test("url is defined", () => {
    const url = "https://jsonplaceholder.typicode.com/todos/1";

    const requestObj = normalizeRequestConfig({
      url,
      method: "GET",
    });
    expect(requestObj.url).toBe(url);
  });

  test("method is defined", () => {
    const method = "GET";

    const requestObj = normalizeRequestConfig({
      url: "https://jsonplaceholder.typicode.com/todos/1",
      method,
    });
    expect(requestObj.method).toBe(method);
  });

  test("headers is defined", () => {
    const headers = {
      "Content-Type": "application/json",
    };

    const requestObj = normalizeRequestConfig({
      url: "https://jsonplaceholder.typicode.com/todos/1",
      method: "GET",
      headers,
    });
    expect(requestObj.headers.get('Content-Type')).toBe(
      headers["Content-Type"]
    );
  });

  // 依赖httpClient.fetch的实现,暂时忽略
  test("body is defined", async () => {
    const body = "test";

    const requestObj = normalizeRequestConfig({
      url: "https://jsonplaceholder.typicode.com/todos/1",
      method: "POST",
      body: body,
    });

    if (!requestObj.body) {
      throw new Error("body is undefined");
    }
    const resData = requestObj.body;

    expect(resData).toBe(body);
  });
});
