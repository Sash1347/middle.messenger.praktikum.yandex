import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService, UserData } from './auth';

vi.mock('./http', () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
  UnauthorizedError: class UnauthorizedError extends Error {
    status = 401;

    constructor(message: string) {
      super(message);
      this.name = 'UnauthorizedError';
    }
  },
}));

const mockHttpClient = vi.mocked(await import('./http')).httpClient;

function createMockUser(overrides: Partial<UserData> = {}): UserData {
  return {
    id: 1,
    first_name: 'John',
    second_name: 'Doe',
    display_name: 'johndoe',
    login: 'johndoe',
    email: 'john@example.com',
    phone: '+1234567890',
    avatar: null,
    ...overrides,
  };
}

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login метод', () => {
    it('отправляет POST запрос с логином и паролем', async () => {
      const mockUser = createMockUser();
      mockHttpClient.post.mockResolvedValue({});
      mockHttpClient.get.mockResolvedValue(mockUser);

      await authService.login('johndoe', 'password123');

      expect(mockHttpClient.post).toHaveBeenCalledWith('/auth/signin', {
        login: 'johndoe',
        password: 'password123',
      });
    });

    it('получает данные пользователя после успешного входа', async () => {
      const mockUser = createMockUser();
      mockHttpClient.post.mockResolvedValue({});
      mockHttpClient.get.mockResolvedValue(mockUser);

      const result = await authService.login('johndoe', 'password123');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/auth/user');
      expect(result).toEqual(mockUser);
    });

    it('сохраняет пользователя в localStorage после входа', async () => {
      const mockUser = createMockUser();
      mockHttpClient.post.mockResolvedValue({});
      mockHttpClient.get.mockResolvedValue(mockUser);

      await authService.login('johndoe', 'password123');

      const stored = localStorage.getItem('auth_user');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(mockUser);
    });

    it('возвращает данные пользователя', async () => {
      const mockUser = createMockUser({ id: 42, login: 'testuser' });
      mockHttpClient.post.mockResolvedValue({});
      mockHttpClient.get.mockResolvedValue(mockUser);

      const result = await authService.login('testuser', 'pass');

      expect(result).toEqual(mockUser);
      expect(result.id).toBe(42);
      expect(result.login).toBe('testuser');
    });
  });

  describe('signup метод', () => {
    it('отправляет POST запрос со всеми данными регистрации', async () => {
      const mockUser = createMockUser();
      mockHttpClient.post.mockResolvedValue({});
      mockHttpClient.get.mockResolvedValue(mockUser);

      await authService.signup(
        'john@example.com',
        'johndoe',
        'John',
        'Doe',
        '+1234567890',
        'password123'
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith('/auth/signup', {
        first_name: 'John',
        second_name: 'Doe',
        login: 'johndoe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
      });
    });

    it('получает данные пользователя после регистрации', async () => {
      const mockUser = createMockUser();
      mockHttpClient.post.mockResolvedValue({});
      mockHttpClient.get.mockResolvedValue(mockUser);

      const result = await authService.signup(
        'john@example.com',
        'johndoe',
        'John',
        'Doe',
        '+1234567890',
        'password123'
      );

      expect(mockHttpClient.get).toHaveBeenCalledWith('/auth/user');
      expect(result).toEqual(mockUser);
    });

    it('сохраняет пользователя в localStorage после регистрации', async () => {
      const mockUser = createMockUser();
      mockHttpClient.post.mockResolvedValue({});
      mockHttpClient.get.mockResolvedValue(mockUser);

      await authService.signup(
        'john@example.com',
        'johndoe',
        'John',
        'Doe',
        '+1234567890',
        'password123'
      );

      const stored = localStorage.getItem('auth_user');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(mockUser);
    });
  });

  describe('logout метод', () => {
    it('отправляет POST запрос на выход', async () => {
      const mockUser = createMockUser();
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      mockHttpClient.post.mockResolvedValue({});

      await authService.logout();

      expect(mockHttpClient.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('очищает localStorage после выхода', async () => {
      const mockUser = createMockUser();
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      mockHttpClient.post.mockResolvedValue({});

      await authService.logout();

      expect(localStorage.getItem('auth_user')).toBeNull();
    });

    it('очищает localStorage даже если запрос не успешен', async () => {
      const mockUser = createMockUser();
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      mockHttpClient.post.mockRejectedValue(new Error('Network error'));

      await expect(authService.logout()).rejects.toThrow('Network error');
      expect(localStorage.getItem('auth_user')).toBeNull();
    });
  });

  describe('getUser метод', () => {
    it('получает данные пользователя с API', async () => {
      const mockUser = createMockUser();
      mockHttpClient.get.mockResolvedValue(mockUser);

      const result = await authService.getUser();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/auth/user');
      expect(result).toEqual(mockUser);
    });

    it('возвращает данные с корректными полями', async () => {
      const mockUser = createMockUser({
        id: 123,
        first_name: 'Jane',
        second_name: 'Smith',
        display_name: 'janesmith',
        login: 'janesmith',
      });
      mockHttpClient.get.mockResolvedValue(mockUser);

      const result = await authService.getUser();

      expect(result.id).toBe(123);
      expect(result.first_name).toBe('Jane');
      expect(result.login).toBe('janesmith');
    });
  });

  describe('checkSession метод', () => {
    it('возвращает true для валидной сессии', async () => {
      const mockUser = createMockUser();
      mockHttpClient.get.mockResolvedValue(mockUser);

      const result = await authService.checkSession();

      expect(result).toBe(true);
    });

    it('сохраняет пользователя при валидной сессии', async () => {
      const mockUser = createMockUser();
      mockHttpClient.get.mockResolvedValue(mockUser);

      await authService.checkSession();

      const stored = localStorage.getItem('auth_user');
      expect(JSON.parse(stored!)).toEqual(mockUser);
    });

    it('возвращает false для UnauthorizedError', async () => {
      const { UnauthorizedError } = await import('./http');
      mockHttpClient.get.mockRejectedValue(new UnauthorizedError('Unauthorized'));

      const result = await authService.checkSession();

      expect(result).toBe(false);
    });

    it('очищает localStorage при UnauthorizedError', async () => {
      const mockUser = createMockUser();
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      const { UnauthorizedError } = await import('./http');
      mockHttpClient.get.mockRejectedValue(new UnauthorizedError('Unauthorized'));

      await authService.checkSession();

      expect(localStorage.getItem('auth_user')).toBeNull();
    });

    it('пробрасывает другие ошибки', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'));

      await expect(authService.checkSession()).rejects.toThrow('Network error');
    });
  });

  describe('isAuthenticated метод', () => {
    it('возвращает true если пользователь в localStorage', () => {
      const mockUser = createMockUser();
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('возвращает false если пользователя нет в localStorage', () => {
      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getAuthUser метод', () => {
    it('возвращает пользователя из localStorage', () => {
      const mockUser = createMockUser();
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      const result = authService.getAuthUser();

      expect(result).toEqual(mockUser);
    });

    it('возвращает null если localStorage пуст', () => {
      const result = authService.getAuthUser();

      expect(result).toBeNull();
    });

    it('возвращает null и очищает localStorage при невалидном JSON', () => {
      localStorage.setItem('auth_user', 'invalid json {');

      const result = authService.getAuthUser();

      expect(result).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
    });

    it('возвращает null если объект не содержит обязательных полей', () => {
      localStorage.setItem('auth_user', JSON.stringify({ name: 'John' }));

      const result = authService.getAuthUser();

      expect(result).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
    });

    it('возвращает null если id не число', () => {
      localStorage.setItem(
        'auth_user',
        JSON.stringify({ id: 'string', login: 'johndoe' })
      );

      const result = authService.getAuthUser();

      expect(result).toBeNull();
    });

    it('возвращает null если login не строка', () => {
      localStorage.setItem(
        'auth_user',
        JSON.stringify({ id: 1, login: 123 })
      );

      const result = authService.getAuthUser();

      expect(result).toBeNull();
    });

    it('возвращает пользователя с правильной типизацией', () => {
      const mockUser = createMockUser({
        id: 999,
        login: 'testlogin',
      });
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      const result = authService.getAuthUser();

      expect(result?.id).toBe(999);
      expect(result?.login).toBe('testlogin');
      expect(typeof result?.id).toBe('number');
      expect(typeof result?.login).toBe('string');
    });
  });

  describe('Интеграция методов', () => {
    it('login -> isAuthenticated -> getAuthUser', async () => {
      const mockUser = createMockUser();
      mockHttpClient.post.mockResolvedValue({});
      mockHttpClient.get.mockResolvedValue(mockUser);

      await authService.login('johndoe', 'password123');

      expect(authService.isAuthenticated()).toBe(true);

      const user = authService.getAuthUser();
      expect(user).toEqual(mockUser);
    });

    it('logout -> isAuthenticated', async () => {
      const mockUser = createMockUser();
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      mockHttpClient.post.mockResolvedValue({});

      expect(authService.isAuthenticated()).toBe(true);

      await authService.logout();

      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
