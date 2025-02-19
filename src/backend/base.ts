import { HttpRequest } from "@/request/HttpRequest";
import { HttpResponse } from "@/response/HttpResponse";

export interface IHttpBackend {
  doRequest: (request: HttpRequest) => Promise<HttpResponse>;
}
