import { type OtherConfig } from "./other";
import type { LifecycleConfig } from "../lifecycle";
/**
 * 请求配置
 *
 * 用户可传可不传
 */
interface BaseRequestConfig {
  url: string;

  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

  headers?: Record<string, string> | globalThis.Headers;

  /**
   *  传递给请求体的数据（目前只支持FormData 和 string）
    Only applicable for request methods 'PUT', 'POST', 'DELETE , and 'PATCH'
    When no `transformRequest` is set, must be of one of the following types:
    - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
    - Browser only: FormData, File, Blob
    - Node only: Stream, Buffer, FormData (form-data package)
   */
  body?: FormData | string | globalThis.ReadableStream;

  /**
   * 用于表示用户代理是否应该在跨域请求的情况下从其他域发送 cookies
   * @docs https://developer.mozilla.org/zh-CN/docs/Web/API/Request/credentials
   *
   * - omit: 从不发送 cookies.
   * - same-origin: 只有当 URL 与响应脚本同源才发送 cookies、HTTP Basic authentication 等验证信息.(浏览器默认值，在旧版本浏览器，例如 safari 11 依旧是 omit，safari 12 已更改)
   * - include: 不论是不是跨域的请求，总是发送请求资源域在本地的 cookies、HTTP Basic authentication 等验证信息。
   */
  credentials?: globalThis.RequestInit["credentials"];
  /**
   * support safari 10.1+
   * @docs https://developer.mozilla.org/zh-CN/docs/Web/API/Request/mode
   *
   * 用于确定跨域请求是否能得到有效的响应，以及响应的哪些属性是可读的。
   *
   * - same-origin — 如果使用此模式向另外一个源发送请求，显而易见，结果会是一个错误。你可以设置该模式以确保请求总是向当前的源发起的。
   * - no-cors — 保证请求对应的 method 只有 HEAD，GET 或 POST 方法，并且请求的 headers 只能有简单请求头 (simple headers)。如果 ServiceWorker 劫持了此类请求，除了 simple header 之外，不能添加或修改其他 header。另外 JavaScript 不会读取 Response 的任何属性。这样将会确保 ServiceWorker 不会影响 Web 语义 (semantics of the Web)，同时保证了在跨域时不会发生安全和隐私泄露的问题。
   * - cors — 允许跨域请求，例如访问第三方供应商提供的各种 API。预期将会遵守 CORS protocol 。仅有有限部分的头部暴露在 Response ，但是 body 部分是可读的。
   * - navigate — 表示这是一个浏览器的页面切换请求 (request)。navigate 请求仅在浏览器切换页面时创建，该请求应该返回 HTML。
   */
  mode?: globalThis.RequestInit["mode"];
  /**
   * support safari 10.1+
   * @docs https://developer.mozilla.org/zh-CN/docs/Web/API/Request/cache
   *
   * 用于指定请求的缓存行为。
   * 
   * - default — 浏览器从 HTTP 缓存中寻找匹配的请求。

   *   - - 如果缓存匹配上并且有效（ fresh）, 它将直接从缓存中返回资源。
   *  - - 如果缓存匹配上但已经过期，浏览器将会使用传统（ conditional request ）的请求方式去访问远程服务器。如果服务器端显示资源没有改动，它将从缓存中返回资源。否则，如果服务器显示资源变动，那么重新从服务器下载资源更新缓存。
   *  - - 如果缓存没有匹配，浏览器将会以普通方式请求，并且更新已经下载的资源缓存。
   * - no-store — 浏览器直接从远程服务器获取资源，不查看缓存，并且不会使用下载的资源更新缓存。

   * - reload — 浏览器直接从远程服务器获取资源，不查看缓存，然后使用下载的资源更新缓存。

   * - no-cache — 浏览器在其 HTTP 缓存中寻找匹配的请求。

   *   - - 如果有匹配，无论是新的还是陈旧的，浏览器都会向远程服务器发出条件请求。如果服务器指示资源没有更改，则将从缓存中返回该资源。否则，将从服务器下载资源并更新缓存。
   *   - - 如果没有匹配，浏览器将发出正常请求，并使用下载的资源更新缓存。
   * - force-cache — 浏览器在其 HTTP 缓存中寻找匹配的请求。

   * - - 如果有匹配项，不管是新匹配项还是旧匹配项，都将从缓存中返回。
   * - - 如果没有匹配，浏览器将发出正常请求，并使用下载的资源更新缓存。
   * - only-if-cached — 浏览器在其 HTTP 缓存中寻找匹配的请求。实验性

   * - - 如果有匹配项 (新的或旧的)，则从缓存中返回。
   * - -如果没有匹配，浏览器将返回一个错误。
   * 仅当请求的mode为 `same-origin` 时，才能使用 `only-if-cached` 模式。如果请求的 'redirect' 属性为 'follow' ，并且重定向不违反 'same-origin' 模式，则将遵循缓存的重定向。
   */
  cache?: globalThis.RequestInit["cache"];
  redirect?: globalThis.RequestInit["redirect"];
  referrer?: globalThis.RequestInit["referrer"];
  referrerPolicy?: globalThis.RequestInit["referrerPolicy"];
  integrity?: globalThis.RequestInit["integrity"];
  /**
   * support safari 13+
   * @docs https://developer.mozilla.org/zh-CN/docs/Web/API/Request/keepalive
   *
   * 该设置指示如果发起请求的页面在请求完成之前卸载，浏览器是否会保持关联的请求处于活动状态。
   *
   * 这使得 fetch() 请求能够在会话结束时发送分析数据，即使用户离开或关闭页面也是如此。与出于相同目的使用 Navigator.sendBeacon() 相比，这具有一些优势，包括允许您使用 POST 之外的 HTTP 方法、自定义请求属性以及通过 fetch Promise 实现访问服务器响应。它也可用于服务人员。
   */
  keepalive?: globalThis.RequestInit["keepalive"];
  /**
   * support safari 13+
   * @docs https://developer.mozilla.org/zh-CN/docs/Web/API/Request/signal
   */
  signal?: globalThis.RequestInit["signal"];
}

export interface RequestConfig
  extends BaseRequestConfig,
    LifecycleConfig,
    Partial<OtherConfig> {}


