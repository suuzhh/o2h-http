# h2o/http

基于 `fetch` 的浏览器http客户端

## 技术细节

### 配置层
目前支持实例配置和触发配置
配置优先级如下
- 触发配置
- 实例配置

### 解析器
处理请求和响应的数据解析（调研是否需要拆分为requestParser和responseParser）

- JSONParser - JSON数据解析


### 请求的生命周期

- onBeforeRequest - 发送请求前
- onAfterRequest - 发送请求后


### 中间件
是否真的需要拦截器， 或者只是需要某些特殊的钩子事件？


### 插件系统

## 使用方法
TODO

## 配置参数

## 测试

简单实现了基于浏览器的测试工具，用于验证功能的完整性