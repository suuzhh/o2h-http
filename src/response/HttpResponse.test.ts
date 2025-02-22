import { describe, expect, test, vitest } from "vitest";
import { HttpResponse } from "./HttpResponse";

describe("HttpResponse", () => {
  const mockResponse = (body: BodyInit, init?: ResponseInit): Response => {
    return new Response(body, init);
  };

  test("createFromResponse应正确初始化实例", () => {
    const originResponse = mockResponse("test", {
      status: 201,
      headers: { "Content-Type": "text/plain" },
    });
    const response = HttpResponse.createFromResponse(originResponse);

    expect(response.status).toBe(201);
    expect(response.headers.get("Content-Type")).toBe("text/plain");
  });

  test("status属性应支持动态修改", () => {
    const response = new HttpResponse(null, { status: 200 });
    response.status = 404;
    expect(response.status).toBe(404);
  });

  describe("数据解析", () => {
    test("应自动处理JSON内容", async () => {
      const mockData = { id: 1 };
      const response = HttpResponse.createFromResponse(
        mockResponse(JSON.stringify(mockData), {
          headers: { "Content-Type": "application/json" },
        })
      );

      await expect(response.json()).resolves.toEqual(mockData);
    });

    test("应缓存JSON解析结果", async () => {
      const mockData = { id: 1 };
      const response = HttpResponse.createFromResponse(
        mockResponse(JSON.stringify(mockData), {
          headers: { "Content-Type": "application/json" },
        })
      );

      const firstCall = await response.json();
      const secondCall = await response.json();
      expect(firstCall).toEqual({ id: 1 });
      expect(secondCall).toBe(firstCall); // 验证缓存
    });

    test("应缓存text解析结果", async () => {
      const response = HttpResponse.createFromResponse(
        mockResponse("test text", {
          headers: { "Content-Type": "text/plain" },
        })
      );

      const firstCall = await response.text();
      const secondCall = await response.text();
      expect(firstCall).toBe("test text");
      expect(secondCall).toBe(firstCall);
    });

    test("应缓存arrayBuffer解析结果", async () => {
      const buffer = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const response = HttpResponse.createFromResponse(
        mockResponse(buffer, {
          headers: { "Content-Type": "application/octet-stream" },
        })
      );

      const firstCall = await response.arrayBuffer();
      const secondCall = await response.arrayBuffer();
      expect(firstCall).toBeInstanceOf(ArrayBuffer);
      expect(secondCall).toBe(firstCall);
    });

    test("应缓存blob解析结果", async () => {
      const blob = new Blob(["test"]);
      const response = HttpResponse.createFromResponse(
        mockResponse(blob)
      );

      const firstCall = await response.blob();
      const secondCall = await response.blob();
      expect(firstCall).toBeInstanceOf(Blob);
      expect(secondCall).toBe(firstCall);
    });

    test("应缓存formData解析结果", async () => {
      const formData = new FormData();
      formData.append("key", "value");
      const response = HttpResponse.createFromResponse(
        mockResponse(formData)
      );

      const firstCall = await response.formData();
      const secondCall = await response.formData();
      expect(firstCall.get("key")).toBe("value");
      expect(secondCall.get("key")).toBe("value");
    });

    test("不同解析方法之间不应互相干扰", async () => {
      const response = HttpResponse.createFromResponse(
        mockResponse(JSON.stringify({ key: "value" }), {
          headers: { "Content-Type": "application/json" },
        })
      );

      const jsonResult = await response.json();
      await expect(response.text()).resolves.not.toBe(jsonResult);
      await expect(response.arrayBuffer()).resolves.not.toBe(jsonResult);
    });
  });

  test("应支持自定义解析器", async () => {
    const customParser = vitest.fn().mockResolvedValue("parsed");
    const response = new HttpResponse("raw data");

    await expect(response.parse(customParser)).resolves.toBe("parsed");
    expect(customParser).toBeCalledWith(response);
  });

  test("应正确处理octet-stream类型", async () => {
    const buffer = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
    const response = HttpResponse.createFromResponse(
      mockResponse(buffer, {
        headers: { "Content-Type": "application/octet-stream" },
      })
    );

    await expect(response.arrayBuffer()).resolves.toEqual(buffer.buffer);
  });

  test("应正确继承Response属性", () => {
    const response = new HttpResponse(null, {
      status: 301,
      statusText: "Moved Permanently",
    });

    expect(response.ok).toBe(false);
    expect(response.statusText).toBe("Moved Permanently");
  });

  test("应支持headers操作", () => {
    const response = new HttpResponse(null, {
      headers: { "X-Custom": "initial" },
    });

    response.headers.set("X-Custom", "modified");
    expect(response.headers.get("X-Custom")).toBe("modified");
  });

  describe("异常处理", () => {
    test("应抛出JSON解析错误", async () => {
      const response = HttpResponse.createFromResponse(
        mockResponse("invalid json", {
          headers: { "Content-Type": "application/json" },
        })
      );

      await expect(response.json()).rejects.toThrow();
    });

    test("应处理空响应体", async () => {
      const response = new HttpResponse(null);
      await expect(response.text()).resolves.toBe("");
    });

    test("应支持clone方法", async () => {
      const origin = new HttpResponse("original", {
        status: 201,
        headers: { "X-Version": "1.0" },
      });

      const cloned = origin.clone();

      // 验证基础属性
      expect(cloned.status).toBe(201);
      expect(cloned.headers.get("X-Version")).toBe("1.0");

      // 验证独立副本
      cloned.status = 202;
      cloned.headers.set("X-Version", "2.0");
      expect(origin.status).toBe(201);
      expect(origin.headers.get("X-Version")).toBe("1.0");

      // 验证响应体独立性
      await expect(origin.text()).resolves.toBe("original");
      // clone后的响应体，如果原始响应体被使用，它将抛出一个TypeError，提示body被使用
      await expect(cloned.text()).rejects.toThrowError(TypeError);
    });
  });

  test("clone方法应创建完全独立副本", async () => {
    const original = new HttpResponse("data", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });

    const cloned = original.clone();

    // 修改克隆实例
    cloned.status = 204;
    cloned.headers.set("Content-Type", "application/json");

    // 验证原始实例不受影响
    expect(original.status).toBe(200);
    expect(original.headers.get("Content-Type")).toBe("text/plain");

    // 验证克隆体修改生效
    expect(cloned.status).toBe(204);
    expect(cloned.headers.get("Content-Type")).toBe("application/json");
  });
});
