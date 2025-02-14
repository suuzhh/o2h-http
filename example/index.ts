import { createDownloader, createHttpClient } from "../src/main";

const downloader = createDownloader();
const httpClient = createHttpClient();

downloader
  .download(
    "https://st4.depositphotos.com/1757635/22304/i/1600/depositphotos_223045340-stock-photo-woman-red-umbrella-waiting-train.jpg"
  )
  .then((data) => {
    console.log(data);
  });

// eslint-disable-next-line no-unused-vars
window.addEventListener("unhandledrejection", (event) => {
  console.error("未捕获的promise rejection -> ", event);
});

async function testAbort() {
  const controller = new AbortController();
  const startTime = performance.now();
  httpClient
    .get("http://www.google.com:82/", {
      signal: controller.signal,
    })
    .then((res) => {
      console.log(res);
    });
  const endTime = performance.now() - startTime;
  controller.abort();
  console.log(endTime);
}

testAbort();
