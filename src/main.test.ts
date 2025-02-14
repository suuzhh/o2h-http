import { createDownloader, createHttpClient } from "./main";
import { describe, expect, test } from "vitest";

describe("createHttpClient", () => {
  const httpClient = createHttpClient();
  test("createHttpClient is defined", () => {
    expect(httpClient).not.toBeUndefined();
  });

  test("createHttpClient.get is defined", async () => {
    const res = await httpClient.get(
      "https://jsonplaceholder.typicode.com/todos/1"
    );

    expect(res.data).not.toBeUndefined();
  });

  test("createHttpClient.post is defined", async () => {
    const res = await httpClient.post(
      "https://jsonplaceholder.typicode.com/todos/1"
    );
    expect(res.data).toBeUndefined();
  });

  test("createHttpClient.lifecycle.onResponseStatusError is be called", async () => {
    httpClient.lifecycle.onResponseStatusError(() => {
      throw new Error("_afterResponseStatusError error");
    });
    const res = await httpClient.post("https://mock.httpstatus.io/400");
    expect(res.error?.message).toBe("_afterResponseStatusError error");
  });

  test("timeout options set 4s", async () => {
    const startTime = performance.now();
    const res = await httpClient.get("http://www.google.com:81/", {
      timeout: 4,
    });
    const endTime = performance.now() - startTime;
    expect(res.error).not.toBeUndefined();
    expect(endTime <= 4500).toBeTruthy();
  });

  test("can be aborted", () =>
    new Promise<void>((done) => {
      const controller = new AbortController();
      const startTime = performance.now();
      httpClient
        .get("http://www.google.com:81/", {
          signal: controller.signal,
        })
        .then((res) => {
          const endTime = performance.now() - startTime;

          const error = res.error;
          // 测试是否包含中断错误
          expect(error instanceof DOMException).toBeTruthy();
          expect((error as DOMException).code).toBe(DOMException.ABORT_ERR);
          expect(endTime <= 4500).toBeTruthy();
          done();
        });

      controller.abort();
    }));
});

describe("createDownloader", () => {
  test("download a jpg file", async () => {
    const downloader = createDownloader();

    const { data: file } = await downloader.download(
      "https://picsum.photos/1200/800"
    );

    expect(file).not.toBeUndefined();
    expect(file instanceof File).toBeTruthy();
    expect(file!.name).toBe("800");
  });
});
