import { createFetchHttpClient, type HttpInterceptorFn } from "../src/main";

const handleError: HttpInterceptorFn = async (req, next) => {
  const result = await next(req);
  if (result.error) {
    console.log(req, result);
  }

  const parsedResult = await result.response.json();
  console.log("success", parsedResult);
  return result;
};

// const downloader = createDownloader();
const httpClient = createFetchHttpClient({
  interceptors: [],
});

// downloader
//   .download(
//     "https://st4.depositphotos.com/1757635/22304/i/1600/depositphotos_223045340-stock-photo-woman-red-umbrella-waiting-train.jpg"
//   )
//   .then((data) => {
//     console.log(data);
//   });

// eslint-disable-next-line no-unused-vars
window.addEventListener("unhandledrejection", (event) => {
  console.error("未捕获的promise rejection -> ", event);
});

async function testAbort() {
  const controller = new AbortController();
  const result = await httpClient.post(
    "https://dev.hp-api.cn/api/manager/order/list",
    '123',
    {
      signal: controller.signal,
    }
  );

  // setTimeout(() => {
  //   controller.abort("123");
  //   console.log("abort");
  // }, 10);
  if (result.error) {
    console.error(result.error);
  }

  console.log("call", result.data);
}

async function testResponseInterceptor() {
  httpClient.useInterceptor(async (req, next) => {
    console.log("interceptor", req);
    const res = await next(req);
    if (res.response.status > 200) {
      throw new Error("123 error");
    }
    return res;
  });
  const result = await httpClient.post(
    "https://dev.hp-api.cn/api/manager/order/list",
    '123',
  );

  console.log(result);
}

async function testFormData() {
  const formData = new FormData();
  formData.append("file", new Blob(["123"]), "123.jpg");
  formData.append("oid", "123");
  const result = await httpClient.post(
    "https://dev.hp-api.cn/api/manager/order/upload",
    formData,
  );

  console.log(result);
}

// testAbort();
// testResponseInterceptor();
testFormData();