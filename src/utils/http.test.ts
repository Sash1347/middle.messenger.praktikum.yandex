import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  HTTPClient,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  NetworkError,
  ResponseParseError,
} from './http';

interface MockRequest {
  withCredentials: boolean;
  status: number;
  responseText: string;
  onload: ((this: MockRequest) => void) | null;
  onerror: ((this: MockRequest) => void) | null;
  open: ReturnType<typeof vi.fn>;
  setRequestHeader: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
}

describe('HTTPClient', () => {
  let xhrInstance: MockRequest;

  beforeEach(() => {
    xhrInstance = {
      withCredentials: false,
      status: 200,
      responseText: '',
      onload: null,
      onerror: null,
      open: vi.fn(),
      setRequestHeader: vi.fn(),
      send: vi.fn(),
    };

    class XMLHttpRequestMock {
      constructor() {
        return xhrInstance;
      }
    }

    vi.stubGlobal('XMLHttpRequest', XMLHttpRequestMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('GET запросы', () => {
    it('отправляет GET запрос с корректным URL', async () => {
      const client = new HTTPClient();
      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.onload?.call(xhr);

      await promise;

      expect(xhrInstance.open).toHaveBeenCalledWith('GET', 'https://ya-praktikum.tech/api/v2/users');
      expect(xhrInstance.send).toHaveBeenCalledWith();
    });

    it('добавляет query параметры в URL', async () => {
      const client = new HTTPClient();
      const promise = client.get('/users', { id: '123', name: 'John' });

      const xhr = xhrInstance;
      xhr.onload?.call(xhr);

      await promise;

      expect(xhrInstance.open).toHaveBeenCalledWith(
        'GET',
        expect.stringContaining('/users?')
      );
    });

    it('возвращает распарсенные данные', async () => {
      const client = new HTTPClient();
      const mockData = { id: 1, name: 'John' };

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.responseText = JSON.stringify({ response: mockData });
      xhr.status = 200;
      xhr.onload?.call(xhr);

      const result = await promise;

      expect(result).toEqual(mockData);
    });
  });

  describe('POST запросы', () => {
    it('отправляет POST запрос с JSON данными', async () => {
      const client = new HTTPClient();
      const data = { name: 'John', email: 'john@example.com' };

      const promise = client.post('/users', data);

      const xhr = xhrInstance;
      xhr.onload?.call(xhr);

      await promise;

      expect(xhrInstance.open).toHaveBeenCalledWith('POST', 'https://ya-praktikum.tech/api/v2/users');
      expect(xhrInstance.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(xhrInstance.send).toHaveBeenCalledWith(JSON.stringify(data));
    });

    it('отправляет POST запрос с FormData', async () => {
      const client = new HTTPClient();
      const formData = new FormData();
      formData.append('file', new Blob(['test']));

      const promise = client.post('/upload', formData);

      const xhr = xhrInstance;
      xhr.onload?.call(xhr);

      await promise;

      expect(xhrInstance.open).toHaveBeenCalledWith('POST', 'https://ya-praktikum.tech/api/v2/upload');
      expect(xhrInstance.send).toHaveBeenCalledWith(formData);
    });

    it('возвращает данные из поля response', async () => {
      const client = new HTTPClient();
      const mockData = { id: 1 };

      const promise = client.post('/users', {});

      const xhr = xhrInstance;
      xhr.responseText = JSON.stringify({ response: mockData });
      xhr.status = 201;
      xhr.onload?.call(xhr);

      const result = await promise;

      expect(result).toEqual(mockData);
    });
  });

  describe('PUT запросы', () => {
    it('отправляет PUT запрос', async () => {
      const client = new HTTPClient();
      const data = { name: 'Jane' };

      const promise = client.put('/users/1', data);

      const xhr = xhrInstance;
      xhr.onload?.call(xhr);

      await promise;

      expect(xhrInstance.open).toHaveBeenCalledWith('PUT', 'https://ya-praktikum.tech/api/v2/users/1');
      expect(xhrInstance.send).toHaveBeenCalledWith(JSON.stringify(data));
    });
  });

  describe('DELETE запросы', () => {
    it('отправляет DELETE запрос с данными', async () => {
      const client = new HTTPClient();
      const data = { id: 123 };

      const promise = client.delete('/users', data);

      const xhr = xhrInstance;
      xhr.onload?.call(xhr);

      await promise;

      expect(xhrInstance.open).toHaveBeenCalledWith('DELETE', 'https://ya-praktikum.tech/api/v2/users');
      expect(xhrInstance.send).toHaveBeenCalledWith(JSON.stringify(data));
    });
  });

  describe('Обработка ошибок', () => {
    it('выбрасывает BadRequestError для статуса 400', async () => {
      const client = new HTTPClient();

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.status = 400;
      xhr.responseText = JSON.stringify({ reason: 'Invalid request' });
      xhr.onload?.call(xhr);

      await expect(promise).rejects.toThrow(BadRequestError);
      await expect(promise).rejects.toThrow('Invalid request');
    });

    it('выбрасывает UnauthorizedError для статуса 401', async () => {
      const client = new HTTPClient();

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.status = 401;
      xhr.responseText = JSON.stringify({ reason: 'Unauthorized' });
      xhr.onload?.call(xhr);

      await expect(promise).rejects.toThrow(UnauthorizedError);
    });

    it('выбрасывает ForbiddenError для статуса 403', async () => {
      const client = new HTTPClient();

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.status = 403;
      xhr.responseText = JSON.stringify({ reason: 'Forbidden' });
      xhr.onload?.call(xhr);

      await expect(promise).rejects.toThrow(ForbiddenError);
    });

    it('выбрасывает NotFoundError для статуса 404', async () => {
      const client = new HTTPClient();

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.status = 404;
      xhr.responseText = JSON.stringify({ reason: 'Not found' });
      xhr.onload?.call(xhr);

      await expect(promise).rejects.toThrow(NotFoundError);
    });

    it('выбрасывает ConflictError для статуса 409', async () => {
      const client = new HTTPClient();

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.status = 409;
      xhr.responseText = JSON.stringify({ reason: 'Conflict' });
      xhr.onload?.call(xhr);

      await expect(promise).rejects.toThrow(ConflictError);
    });

    it('выбрасывает HttpError для прочих ошибок', async () => {
      const client = new HTTPClient();

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.status = 500;
      xhr.responseText = JSON.stringify({ reason: 'Server error' });
      xhr.onload?.call(xhr);

      await expect(promise).rejects.toThrow(HttpError);
    });

    it('использует fallback сообщение при ошибке парсинга', async () => {
      const client = new HTTPClient();

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.status = 400;
      xhr.responseText = 'invalid json {';
      xhr.onload?.call(xhr);

      await expect(promise).rejects.toThrow('Request failed with status 400');
    });

    it('выбрасывает NetworkError при сетевой ошибке', async () => {
      const client = new HTTPClient();

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.onerror?.call(xhr);

      await expect(promise).rejects.toThrow(NetworkError);
    });

    it('выбрасывает ResponseParseError при ошибке парсинга ответа', async () => {
      const client = new HTTPClient();

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.status = 200;
      xhr.responseText = 'invalid json {';
      xhr.onload?.call(xhr);

      await expect(promise).rejects.toThrow(ResponseParseError);
    });
  });

  describe('Пользовательские заголовки', () => {
    it('добавляет пользовательские заголовки', async () => {
      const client = new HTTPClient();
      const headers = { Authorization: 'Bearer token123' };

      const promise = client.get('/users', undefined, { headers });

      const xhr = xhrInstance;
      xhr.onload?.call(xhr);

      await promise;

      expect(xhrInstance.setRequestHeader).toHaveBeenCalledWith('Authorization', 'Bearer token123');
    });
  });

  describe('Пустые ответы', () => {
    it('обрабатывает пустой ответ OK', async () => {
      const client = new HTTPClient();

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.status = 200;
      xhr.responseText = 'OK';
      xhr.onload?.call(xhr);

      const result = await promise;

      expect(result).toEqual({});
    });

    it('обрабатывает пустой responseText', async () => {
      const client = new HTTPClient();

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.status = 200;
      xhr.responseText = '';
      xhr.onload?.call(xhr);

      const result = await promise;

      expect(result).toEqual({});
    });
  });

  describe('Кастомный baseURL', () => {
    it('использует кастомный baseURL', async () => {
      const client = new HTTPClient('https://custom.api.com');

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.onload?.call(xhr);

      await promise;

      expect(xhrInstance.open).toHaveBeenCalledWith('GET', 'https://custom.api.com/users');
    });
  });

  describe('Credentials', () => {
    it('устанавливает withCredentials на true', async () => {
      const client = new HTTPClient();

      const promise = client.get('/users');

      const xhr = xhrInstance;
      xhr.onload?.call(xhr);

      await promise;

      expect(xhrInstance.withCredentials).toBe(true);
    });
  });

  describe('Классы ошибок', () => {
    it('HttpError имеет правильное имя и статус', () => {
      const error = new HttpError('Test error', 500);

      expect(error.name).toBe('HttpError');
      expect(error.status).toBe(500);
      expect(error.message).toBe('Test error');
    });

    it('BadRequestError наследуется от HttpError', () => {
      const error = new BadRequestError('Bad request');

      expect(error).toBeInstanceOf(HttpError);
      expect(error.name).toBe('BadRequestError');
      expect(error.status).toBe(400);
    });

    it('UnauthorizedError наследуется от HttpError', () => {
      const error = new UnauthorizedError('Unauthorized');

      expect(error).toBeInstanceOf(HttpError);
      expect(error.name).toBe('UnauthorizedError');
      expect(error.status).toBe(401);
    });

    it('ForbiddenError наследуется от HttpError', () => {
      const error = new ForbiddenError('Forbidden');

      expect(error).toBeInstanceOf(HttpError);
      expect(error.name).toBe('ForbiddenError');
      expect(error.status).toBe(403);
    });

    it('NotFoundError наследуется от HttpError', () => {
      const error = new NotFoundError('Not found');

      expect(error).toBeInstanceOf(HttpError);
      expect(error.name).toBe('NotFoundError');
      expect(error.status).toBe(404);
    });

    it('ConflictError наследуется от HttpError', () => {
      const error = new ConflictError('Conflict');

      expect(error).toBeInstanceOf(HttpError);
      expect(error.name).toBe('ConflictError');
      expect(error.status).toBe(409);
    });

    it('NetworkError имеет правильное имя', () => {
      const error = new NetworkError();

      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Network request failed');
    });

    it('ResponseParseError имеет правильное имя', () => {
      const error = new ResponseParseError();

      expect(error.name).toBe('ResponseParseError');
      expect(error.message).toBe('The server returned an invalid response');
    });
  });
});

