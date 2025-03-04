# o2h/http

基于 `fetch` 的浏览器 http 客户端

## 技术细节

### Backend

抽象并包装默认的请求和响应对象，以适配不同运行环境和网络请求库。该层旨在统一处理各种请求实例（例如，浏览器原生 fetch、Node.js 环境下的 fetch 兼容库等），从而屏蔽底层网络实现的差异。适配过程中，会根据运行环境自动选择或切换到合适的请求实现，以保证请求行为的一致性。

当前已实现对浏览器原生 fetch（即 browser fetch） API 的适配，确保在浏览器环境下使用原生 fetch 发起请求时行为符合预期。

### Interceptor

拦截器是一种设计模式，用于在请求和响应的生命周期中插入自定义逻辑，从而实现对请求和响应的拦截和处理。

#### 关于拦截器中抛出的异常
具体代码在h2o-http\src\interceptor\index.ts L46-L57
拦截器执行过程中抛出的异常会被捕获并统一处理为HttpResult类型返回给下一个interceptor处理。
注意此时HttpResult的error属性将被设置为InterceptorError，且response属性将被置空。
拦截器抛出的异常会被捕获并统一处理为HttpResult类型返回。

### Parser

处理请求和响应的数据解析（调研是否需要拆分为 requestParser 和 responseParser）

- JSONParser - JSON 数据解析
- BlobParser - Blob 数据解析

### HttpClient

HttpClient 是一个 HTTP 客户端包装类，提供具体的请求方法供用户调用。
其内部包含以下核心组件：

- Interceptor
- Backend
- Parser (待实装)

目前支持实例配置和触发配置
配置优先级如下

- 触发配置
- 实例配置

## 使用方法

### 安装

```bash
npm install @o2h/http
pnpm add @o2h/http
yarn add @o2h/http
```

### 基本使用

```js
import { createFetchHttpClient } from "@o2h/http";

// 创建拦截器函数
const handleError: HttpInterceptorFn = async (request, next) => {
  // before request send
  const res = await next(request);
  // after request send
  return res;
};

// 创建基于fetch的http实例
const httpClient = createFetchHttpClient({
  // 添加拦截器
  interceptors: [handleError],
});

// 动态添加拦截器
httpClient.useInterceptor(handleError);

// 发送请求
const res = await httpClient.get("https://www.baidu.com");

// 获取响应数据
const data = res.data;

// 获取错误信息
const error = res.error;
```

## How to test

基于 vitest 实现基础单元测试
