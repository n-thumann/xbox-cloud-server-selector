import { Settings } from "../settings";

interface RequestPattern {
  method: string;
  // @ts-ignore: URLPattern is not known to Typescript yet
  urlPattern: URLPattern;
}

interface Interceptor {
  requestPattern: RequestPattern;
  intercept(settings: Settings, response: Response): Promise<Response>;
}

export { RequestPattern, Interceptor };
