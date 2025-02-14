import { BlobParser, JSONParser } from "@/parser";
import { describe, expect, test } from "vitest";

describe("JSONParser", () => {
  const parser = new JSONParser();
  test("parseResponse is defined", async () => {
    const res = await parser.parse(new Response(JSON.stringify({ a: 1 })));
    expect(res.result).toEqual({ a: 1 });
  });

  test("parseResponse parse empty string", async () => {
    const res = await parser.parse(new Response("   "));
    expect(res.result).toBeUndefined();
  });

  test("parseResponse result.isSuccess is false", async () => {
    const res = await parser.parse(new Response("[}"));
    expect(res.isSuccess).toBeFalsy();
  });
});

describe("BlobParser", () => {
  const parser = new BlobParser();
  // 解析json对象为字符串
  test("parseResponse response type is Blob", async () => {
    const res = await parser.parse(new Response(JSON.stringify({ a: 1 })));
    expect(res.result instanceof Blob).toEqual(true);
  });
});
