export function parseURL(url: string): URL {
  const reg = /^(http|https):\/\//;
  // 需要处理相对路径的地址
  if (reg.test(url)) {
    return new URL(url);
  }
  // 未设置协议头或者是相对路径的情况下需要设置 base 参数
  return new URL(url, window.location.origin);
}
