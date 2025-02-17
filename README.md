# o2h/http

基于 `fetch` 的浏览器http客户端

## 技术细节

### 包装层
抽象默认的请求、响应对象，用于适配多种请求实例

目前已实现browser-fetch的适配

### 配置层
目前支持实例配置和触发配置
配置优先级如下
- 触发配置
- 实例配置

### 解析器
处理请求和响应的数据解析（调研是否需要拆分为requestParser和responseParser）

- JSONParser - JSON数据解析
- BlobParser - Blob数据解析

### 请求的生命周期

- onBeforeRequest - 发送请求前
- onAfterRequest - 发送请求后
- onResponseStatusError - 响应状态错误,默认为状态码大于等于400时抛出错误，可通过`validateStatus`配置自定义错误的逻辑

### 插件系统(待定)

## 使用方法

### 安装

```bash
npm install @o2h/http
pnpm add @o2h/http
yarn add @o2h/http

```
### 基本使用

```js
import { createHttpClient } from "@o2h/http";

// 创建实例
const httpClient = createHttpClient()；

// 发送请求
const res = await httpClient.get("https://www.baidu.com")

// 获取响应数据
const data = res.data;

// 获取错误信息
const error = res.error;

```

## 配置参数

## 测试

简单实现了基于浏览器的测试工具，用于验证功能的完整性