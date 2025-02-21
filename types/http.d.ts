/**
 * client adaptor request options
 *
 * 这些配置暴露给用户，用户可以根据自己的需求，自定义配置
 */
interface IHttpClientRequestOptions {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
    headers: Record<string, string> | Headers;
    /**
     *  传递给请求体的数据（目前只支持FormData 和 string）
      Only applicable for request methods 'PUT', 'POST', 'DELETE , and 'PATCH'
      When no `transformRequest` is set, must be of one of the following types:
      - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
      - Browser only: FormData, File, Blob
      - Node only: Stream, Buffer, FormData (form-data package)
     */
    body?: FormData | string;
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
    /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
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
    signal: globalThis.RequestInit["signal"] | null;
}
interface IOhterOptions {
    /**
     * a function that takes a numeric status code and returns a boolean indicating whether the status is valid. If the status is not valid, the result will be failed. then call `onResponseStatusError` lifecycle method
     * @param status HTTP status code
     * @returns
     */
    validateStatus: (status: number) => boolean;
    /**
     * 请求超时时间
     *
     * 0 表示不限制 使用系统默认超时时间
     */
    timeout: number;
}
/** 适配器 请求对象
 *
 * @TODO 实现HttpRequest对象
 */
interface IHTTPRequestConfig extends IHttpClientRequestOptions, IOhterOptions {
    /** headers字段在内部最终统一转为Headers对象 */
    headers: Headers;
}
/** user request config
 * @deprecated
 */
type RequestConfig$1 = Partial<IHttpClientRequestOptions & IOhterOptions>;

type SuccessResult<T> = {
    /** 解析是否成功 */
    isSuccess: true;
    result: T;
    error?: never;
};
type ErrorResult = {
    isSuccess: false;
    result?: never;
    /**
     * 解析错误 需要统一为对象结构
     * 使用原生error有一定局限性， 需要更加定制化的实现错误
     */
    error: {
        /** 原始错误 */
        cause: Error;
    };
};
type ParseResult<T = string> = SuccessResult<T> | ErrorResult;
/**
 * 数据解析器的接口
 *
 * 外部可自行通过该接口自行实现需要的解析器
 */
interface IResponseParser {
    parse<T = string>(response: globalThis.Response): ParseResult<T> | Promise<ParseResult<T>>;
}

declare class BlobParser implements IResponseParser {
    parse<T = Blob>(response: globalThis.Response): Promise<ParseResult<T>>;
}

declare class JSONParser implements IResponseParser {
    /**
     * 解析 JSON 数据
     * @param data JSON 字符串
     * @returns 一个 ParseResult 对象，result 是解析后的数据，error 是解析时的错误
     */
    parse<T>(response: globalThis.Response): Promise<ParseResult<T>>;
}

interface Lifecycle {
    beforeRequest: (req: IHTTPRequestConfig) => Promise<IHTTPRequestConfig> | IHTTPRequestConfig | undefined;
    /**
     *
     * @deprecated - use `onResponseError` callback instead
     * 在响应状态未通过校验时触发
     *
     * 可通过 validateStatus 来自定义校验规则
     */
    onResponseStatusError: (req: IHTTPRequestConfig, res: globalThis.Response) => Promise<Error> | Error | undefined | void;
    /**
     * 请求未响应（非abort和timeout）和 response状态码未通过 `validateStatus` 校验时触发
     * @param req
     * @param {Response | undefined} res - 响应对象，在cors和断网情况下可能为空
     * @returns
     */
    onResponseError: (req: IHTTPRequestConfig, res?: globalThis.Response) => Promise<void> | void;
}
interface LifecycleResult<T> {
    result?: T;
    error?: Error;
}
/**
 * implements all Http Lifecycle
 *
 * 声明周期应该只做事件回调的分发，不修改配置
 * 如果需要在请求中修改配置，请使用 `pipeline`(规划中)
 */
declare class LifecycleCaller {
    /**
     * lifecycle method only defined singlely
     */
    private __lifecycle__;
    private __eventTarget__;
    call<T extends keyof Lifecycle>(name: T, ...args: Parameters<Lifecycle[T]>): Promise<LifecycleResult<Awaited<ReturnType<Lifecycle[T]>>>>;
    beforeRequest: (fn: Lifecycle["beforeRequest"]) => () => void;
    onResponseStatusError: (fn: Lifecycle["onResponseStatusError"]) => () => void;
    emit<NAME extends keyof Lifecycle>(name: NAME, ...args: Parameters<Lifecycle[NAME]>): void;
    onResponseError: (fn: Lifecycle["onResponseError"]) => () => void;
    addEventListener: <NAME extends keyof Lifecycle>(name: NAME, fn: Lifecycle[NAME]) => () => void;
}

/** Promise结果包装类 */
type IResult<T = object, E = Error> = {
    error: E;
    data?: undefined;
} | {
    data: T;
    error?: undefined;
};

interface IHttpClientAdaptor {
    doRequest: <R>(request: IHTTPRequestConfig) => Promise<IResult<R>>;
}

/**
 * @deprecated
 */
interface IHttpClient {
    post<R = unknown, P = unknown>(url: string, data?: P, config?: RequestConfig$1): Promise<IResult<R>>;
    get<P = Record<string, string | number>, R = unknown>(url: string, options?: Omit<RequestConfig$1, "url" | "method" | "body"> & {
        query?: P;
    }): Promise<IResult<R>>;
}
declare class HttpClient$1 implements IHttpClient {
    readonly lifecycle: LifecycleCaller;
    readonly fetchClient: IHttpClientAdaptor;
    constructor(responseParser?: IResponseParser);
    post<R = unknown, P = unknown>(url: string, data?: P, config?: RequestConfig$1): Promise<IResult<R>>;
    get<R = Record<string, string>, P = Record<string, string | number> | string>(url: string, options?: Omit<RequestConfig$1, "url" | "method" | "body"> & {
        query?: P;
    }): Promise<IResult<R>>;
}

/**
 * 内部使用的请求配置
 * 用到哪些再实现，不要一次性扩展太多
 * */
interface INTERNAL_RequestConfig {
    url: URL;
    method: "GET" | "POST";
    headers: Headers;
    body?: Body["body"] | FormData | string;
}
declare class HttpRequest extends Request {
    readonly _originalConfig: INTERNAL_RequestConfig;
    constructor(config: INTERNAL_RequestConfig);
    clone(): HttpRequest;
}

declare class HttpResponse extends Response {
    private _parsedBody?;
    private _headers;
    private _status;
    constructor(body?: BodyInit | null, init?: ResponseInit);
    get headers(): Headers;
    get status(): number;
    set status(code: number);
    parse<T = any>(parser?: (response: Response) => Promise<T>): Promise<T>;
    private getDefaultParser;
    json<T = any>(): Promise<T>;
    text(): Promise<string>;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
    formData(): Promise<FormData>;
    clone(): HttpResponse;
    static createFromResponse(response: Response): HttpResponse;
}

declare class ResultError extends Error {
    readonly type: Readonly<ResultErrorType>;
    /** 响应对象 */
    constructor(type: Readonly<ResultErrorType>, message?: string);
}
declare enum ResultErrorType {
    NetworkError = "NetworkError",
    TimeoutError = "TimeoutError",
    AbortError = "AbortError",
    /** 状态码验证错误 */
    StatusValidateError = "StatusValidateError"
}

interface IHttpBackend {
    doRequest: (request: HttpRequest, 
    /** 用户可配置的配置项 */
    config: Readonly<CommonConfig>) => Promise<HttpResult>;
}
/** 用户可配置的配置项 */
interface CommonConfig {
    /** 超时时间 单位：秒 */
    timeout: number;
    /** 校验响应状态 */
    validateStatus: (status: number) => boolean;
}
interface HttpResult {
    /** 响应对象 */
    response: HttpResponse | null;
    /** 错误对象 */
    error: ResultError | null;
}

type HttpHandlerFn = (
/** 请求配置， 由于配置对象可被修改， 可能存在配置被误删除的情况，需要使用对象现在配置的修改   */
req: HttpRequest) => Promise<HttpResult>;
/**
 * 请求拦截器类型
 * @public
 */
type HttpInterceptorFn = (req: HttpRequest, next: HttpHandlerFn) => Promise<HttpResult>;
interface HttpInterceptorConfig {
    request?: HttpInterceptorFn[];
    response?: HttpInterceptorFn[];
}
declare class HttpInterceptorHandler {
    private interceptors;
    private backend;
    private static config;
    constructor(interceptors: HttpInterceptorFn[], backend: IHttpBackend);
    static configure(callback: (config: HttpInterceptorConfig) => void): typeof HttpInterceptorHandler;
    handle(initReq: HttpRequest, commonConfig: CommonConfig): Promise<HttpResult>;
}

/** 替换掉RequestConfig */
interface CompleteHttpClientConfig {
    /** 请求拦截器函数 */
    interceptors: HttpInterceptorFn[];
}
type HttpClientConfig = Partial<CompleteHttpClientConfig>;
interface CompleteRequestConfig {
    /**
     * a function that takes a numeric status code and returns a boolean indicating whether the status is valid. If the status is not valid, the result will be failed. then call `onResponseStatusError` lifecycle method
     * @param status HTTP status code
     * @returns
     */
    validateStatus: (status: number) => boolean;
    /**
     * 请求超时时间
     *
     * 0 表示不限制 使用系统默认超时时间
     */
    timeout: number;
    /**
     * support safari 13+
     * @docs https://developer.mozilla.org/zh-CN/docs/Web/API/Request/signal
     */
    signal: globalThis.RequestInit["signal"] | null;
    url: string;
    headers: Record<string, string> | Headers;
    /**
     *  传递给请求体的数据（目前只支持FormData 和 string 和 js对象）
      Only applicable for request methods 'PUT', 'POST', 'DELETE , and 'PATCH'
      When no `transformRequest` is set, must be of one of the following types:
      - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
      - Browser only: FormData, File, Blob
      - Node only: Stream, Buffer, FormData (form-data package)
     */
    body?: FormData | string | Record<string | number, any>;
}
type RequestConfig = Partial<CompleteRequestConfig>;
interface IHttpMethods {
    request<R = unknown>(config: RequestConfig): Promise<IResult<R>>;
    post<R = unknown, P = unknown>(url: string, data?: P, config?: RequestConfig): Promise<IResult<R>>;
    get<P = Record<string, string | number>, R = unknown>(url: string, options?: Omit<RequestConfig, "url" | "method" | "body"> & {
        query?: P;
    }): Promise<IResult<R>>;
}
declare abstract class HttpClient {
    protected httpBackend: IHttpBackend;
    protected interceptorHandler: HttpInterceptorHandler;
    constructor({ interceptors }: CompleteHttpClientConfig, httpBackend: IHttpBackend);
}
declare class FetchHttpClient extends HttpClient implements IHttpMethods {
    readonly responseParser: JSONParser;
    constructor({ interceptors }?: HttpClientConfig);
    request<R = unknown>(config: RequestConfig & {
        method?: string;
    }): Promise<IResult<R>>;
    post<R = unknown, P = unknown>(url: string, data?: P, config?: RequestConfig): Promise<IResult<R>>;
    get<R = unknown, P = Record<string, string | number>>(url: string, options?: Omit<RequestConfig, "url" | "body"> & {
        query?: P;
    }): Promise<IResult<R>>;
}

/**
 * 即将重构，欢迎使用createFetchHttpClient体验新版客户端
 * @returns
 */
declare function createHttpClient(): HttpClient$1;
declare function createDownloader(): {
    /**
     * 下载文件
     * @param url 文件url
     * @param filename 指定文件名
     * @returns {{data: File, error?: Error}} 下载的文件对象, 或者出错信息
     */
    download(url: string, { filename, query, }?: {
        query?: Record<string, string | number> | string;
        filename?: string;
    }): Promise<{
        error: Error;
        data?: undefined;
    } | {
        data: File;
        error?: undefined;
    }>;
};
declare function createFetchHttpClient(config?: HttpClientConfig): FetchHttpClient;

export { BlobParser, createDownloader, createFetchHttpClient, createHttpClient };
