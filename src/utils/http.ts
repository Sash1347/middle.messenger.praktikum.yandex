export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  headers?: Record<string, string>;
}

export class HttpError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Network request failed');
    this.name = 'NetworkError';
  }
}

export class ResponseParseError extends Error {
  constructor() {
    super('The server returned an invalid response');
    this.name = 'ResponseParseError';
  }
}

function parseErrorResponse(responseText: string, status: number): HttpError {
  const fallbackMessage = `Request failed with status ${status}`;
  let message = fallbackMessage;

  try {
    const body: unknown = responseText ? JSON.parse(responseText) : null;
    if (body && typeof body === 'object' && 'reason' in body && typeof body.reason === 'string') {
      message = body.reason;
    }
  } catch {
    message = fallbackMessage;
  }

  switch (status) {
    case 400:
      return new BadRequestError(message);
    case 401:
      return new UnauthorizedError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    case 409:
      return new ConflictError(message);
    default:
      return new HttpError(message, status);
  }
}

export class HTTPClient {
  private baseURL: string;

  constructor(baseURL: string = 'https://ya-praktikum.tech/api/v2') {
    this.baseURL = baseURL;
  }

  private buildURL(path: string, params?: Record<string, string>): string {
    let url = this.baseURL + path;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += '?' + queryString;
    }
    return url;
  }

  private request<T>(
    method: HTTPMethod,
    url: string,
    options: RequestOptions = {},
    data?: Record<string, unknown> | FormData,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.withCredentials = true;

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            let parsed: unknown = {};
            if (xhr.responseText && xhr.responseText !== 'OK') {
              parsed = JSON.parse(xhr.responseText);
            }
            const response = parsed && typeof parsed === 'object' && 'response' in parsed
              ? parsed.response
              : parsed;
            resolve(response as T);
          } catch {
            reject(new ResponseParseError());
          }
        } else {
          reject(parseErrorResponse(xhr.responseText, xhr.status));
        }
      };

      xhr.onerror = () => {
        reject(new NetworkError());
      };

      xhr.open(method, url);

      const headers = { ...options.headers };
      if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      if (data instanceof FormData) {
        xhr.send(data);
      } else if (data) {
        xhr.send(JSON.stringify(data));
      } else {
        xhr.send();
      }
    });
  }

  get<T>(path: string, params?: Record<string, string>, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(path, params);
    return this.request<T>('GET', url, options);
  }

  post<T>(path: string, data?: Record<string, unknown> | FormData, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(path);
    return this.request<T>('POST', url, options, data);
  }

  put<T>(path: string, data?: Record<string, unknown> | FormData, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(path);
    return this.request<T>('PUT', url, options, data);
  }

  delete<T>(
    path: string,
    data?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<T> {
    const url = this.buildURL(path);
    return this.request<T>('DELETE', url, options, data);
  }
}

export const httpClient = new HTTPClient();
