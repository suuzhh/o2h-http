import { HttpInterceptorHandler } from "./index";
import { HttpRequest } from "@/request/HttpRequest";
import { HttpResponse } from "@/response/HttpResponse";
import { ResultError, ResultErrorType } from "@/backend/internal-error";
import { describe, it, expect, vi } from "vitest";

describe("HttpInterceptorHandler", () => {
  const mockReq = new HttpRequest({
    method: "GET",
    url: new URL("https://example.com"),
    headers: new Headers(),
  });
  const mockBackend = {
    doRequest: vi.fn().mockResolvedValue({ response: "ok", error: null }),
  };
  const commonConfig = {
    timeout: 0,
    validateStatus: () => true,
  };

  it("should handle request without interceptors", async () => {
    const handler = new HttpInterceptorHandler([], mockBackend);

    const result = await handler.handle(mockReq, commonConfig);

    expect(result).toEqual({ response: "ok", error: null });
    expect(mockBackend.doRequest).toBeCalledWith(mockReq, commonConfig);
  });

  it("should handle request with interceptors", async () => {
    const interceptor1 = vi.fn().mockImplementation((req, next) => next(req));
    const interceptor2 = vi.fn().mockImplementation((req, next) => next(req));

    const handler = new HttpInterceptorHandler(
      [interceptor1, interceptor2],
      mockBackend
    );

    const result = await handler.handle(mockReq, commonConfig);

    expect(interceptor1).toBeCalled();
    expect(interceptor2).toBeCalled();
    expect(result).toEqual({ response: "ok", error: null });
  });

  it("should handle interceptor error", async () => {
    const error = new Error("interceptor error");
    const interceptor = vi.fn().mockRejectedValue(error);

    const handler = new HttpInterceptorHandler([interceptor], mockBackend);

    const result = await handler.handle(mockReq, commonConfig);

    expect(result).toEqual({
      response: null,
      error: new ResultError(
        ResultErrorType.InterceptorError,
        "interceptor error"
      ),
    });
  });

  it("should handle global error", async () => {
    const error = new Error("global error");
    mockBackend.doRequest.mockRejectedValueOnce(error);

    const handler = new HttpInterceptorHandler([], mockBackend);

    const result = await handler.handle(mockReq, commonConfig);

    expect(result).toEqual({
      response: null,
      error: new ResultError(ResultErrorType.InterceptorError, "global error"),
    });
  });

  it("should execute interceptors in correct order", async () => {
    const calls: string[] = [];
    const interceptor1 = vi.fn().mockImplementation((req, next) => {
      calls.push("interceptor1");
      return next(req);
    });
    const interceptor2 = vi.fn().mockImplementation((req, next) => {
      calls.push("interceptor2");
      return next(req);
    });

    const handler = new HttpInterceptorHandler(
      [interceptor1, interceptor2],
      mockBackend
    );

    await handler.handle(mockReq, commonConfig);

    expect(calls).toEqual(["interceptor1", "interceptor2"]);
  });

  it("dynamic add interceptor, should execute interceptors in correct order", async () => {
    const calls: string[] = [];

    const interceptor1 = vi.fn().mockImplementation(async (req, next) => {
      calls.push("interceptor1_before");
      const res = await next(req);
      calls.push("interceptor1_after");
      return res;
    });
    const interceptor2 = vi.fn().mockImplementation(async (req, next) => {
      calls.push("interceptor2_before");
      const res = await next(req);
      calls.push("interceptor2_after");
      return res;
    });

    const handler = new HttpInterceptorHandler([], mockBackend);

    handler.addInterceptor(interceptor1);
    handler.addInterceptor(interceptor2);

    const result = await handler.handle(mockReq, commonConfig);

    expect(interceptor1).toBeCalled();
    expect(interceptor2).toBeCalled();
    expect(result).toEqual({ response: "ok", error: null });
    expect(calls).toEqual([
      "interceptor1_before",
      "interceptor2_before",
      "interceptor2_after",
      "interceptor1_after",
    ]);
  });

  it("should set baseHandlerHasBeenCalled flag when baseHandler is executed", async () => {
    // Mock console.warn to prevent console output during test
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });

    const mockResponse = new HttpResponse("success", { status: 200 });
    const mockBackendResponse = { response: mockResponse, error: null };
    mockBackend.doRequest.mockResolvedValueOnce(mockBackendResponse);

    // Create an interceptor that doesn't call next
    const interceptor = vi.fn().mockImplementation(() => {
      // Return undefined to trigger the fallback logic
      return undefined as any;
    });

    const handler = new HttpInterceptorHandler([interceptor], mockBackend);
    const result = await handler.handle(mockReq, commonConfig);

    // Verify the fallback warning message about not calling next
    expect(consoleWarnSpy).toHaveBeenCalledWith("The second argument of interceptor function must be call.");
    expect(result.error?.message).toBe("Interceptor not have a valid result");

    consoleWarnSpy.mockRestore();
  });

  it("should save first interceptor result to lastResult", async () => {
    const mockResponse1 = new HttpResponse("response1", { status: 200 });
    const mockResponse2 = new HttpResponse("response2", { status: 200 });

    const interceptor1 = vi.fn().mockImplementation(async (req, next) => {
      // This should be saved as lastResult
      const res = await next(req);
      return { response: mockResponse1, error: null };
    });

    const interceptor2 = vi.fn().mockImplementation(async (req, next) => {
      // This will overwrite the result
      const res = await next(req);
      return { response: mockResponse2, error: null };
    });

    const handler = new HttpInterceptorHandler([interceptor1, interceptor2], mockBackend);
    const result = await handler.handle(mockReq, commonConfig);

    // The final result should be from interceptor1
    expect(result.response).toBe(mockResponse1);

    // Verify interceptors were called
    expect(interceptor1).toBeCalled();
    expect(interceptor2).toBeCalled();

    // Since interceptor1 returned early, backend.doRequest should not be called
    expect(mockBackend.doRequest).toBeCalled();
  });

  it("should fallback to lastResult when interceptor returns invalid result after baseHandler is called", async () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });

    const mockResponse = new HttpResponse("backend response", { status: 200 });
    mockBackend.doRequest.mockResolvedValueOnce({ response: mockResponse, error: null });

    const interceptor = vi.fn().mockImplementation(async (req, next) => {
      // First call next to invoke baseHandler
      const res = await next(req);
      // Then return invalid result to trigger fallback
      return undefined as any;
    });

    const handler = new HttpInterceptorHandler([interceptor], mockBackend);
    const result = await handler.handle(mockReq, commonConfig);

    // Should warn about invalid interceptor result
    expect(consoleWarnSpy).toHaveBeenCalledWith("Can't receive interceptor result, fallback to previous result.");

    // Should fallback to the baseHandler result
    expect(result.response).toBe(mockResponse);
    expect(mockBackend.doRequest).toHaveBeenCalledWith(mockReq, commonConfig);

    consoleWarnSpy.mockRestore();
  });

  it("should handle case when baseHandler is called but returns error", async () => {
    const mockError = new ResultError(ResultErrorType.StatusValidateError, "Network failure");
    mockBackend.doRequest.mockResolvedValueOnce({ response: null, error: mockError });

    const handler = new HttpInterceptorHandler([], mockBackend);
    const result = await handler.handle(mockReq, commonConfig);

    // Should return the error from baseHandler
    expect(result.error).toBe(mockError);
    expect(result.response).toBeNull();
    expect(mockBackend.doRequest).toHaveBeenCalledWith(mockReq, commonConfig);
  });
});
