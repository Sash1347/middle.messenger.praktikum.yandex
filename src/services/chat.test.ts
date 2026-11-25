import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatService, type ChatData, type ChatUser } from './chat';

vi.mock('../utils/http', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockHttpClient = vi.mocked((await import('../utils/http')).httpClient, { deep: true });

function createMockChat(overrides: Partial<ChatData> = {}): ChatData {
  return {
    id: 1,
    title: 'Test Chat',
    avatar: null,
    unread_count: 0,
    ...overrides,
  };
}

function createMockChatUser(overrides: Partial<ChatUser> = {}): ChatUser {
  return {
    id: 1,
    first_name: 'John',
    second_name: 'Doe',
    display_name: 'johndoe',
    login: 'johndoe',
    avatar: null,
    ...overrides,
  };
}

describe('ChatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChats метод', () => {
    it('получает список всех чатов', async () => {
      const mockChats = [
        createMockChat({ id: 1, title: 'Chat 1' }),
        createMockChat({ id: 2, title: 'Chat 2' }),
      ];
      mockHttpClient.get.mockResolvedValue(mockChats);

      const result = await chatService.getChats();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/chats');
      expect(result).toEqual(mockChats);
    });

    it('возвращает пустой массив если нет чатов', async () => {
      mockHttpClient.get.mockResolvedValue([]);

      const result = await chatService.getChats();

      expect(result).toEqual([]);
    });

    it('возвращает чаты с корректной структурой', async () => {
      const mockChats = [
        createMockChat({
          id: 42,
          title: 'Important Chat',
          avatar: 'https://example.com/avatar.jpg',
          unread_count: 5,
        }),
      ];
      mockHttpClient.get.mockResolvedValue(mockChats);

      const result = await chatService.getChats();

      expect(result[0].id).toBe(42);
      expect(result[0].title).toBe('Important Chat');
      expect(result[0].unread_count).toBe(5);
    });
  });

  describe('createChat метод', () => {
    it('создаёт новый чат с заданным названием', async () => {
      mockHttpClient.post.mockResolvedValue({ id: 123 });

      const result = await chatService.createChat('New Chat');

      expect(mockHttpClient.post).toHaveBeenCalledWith('/chats', { title: 'New Chat' });
      expect(result.id).toBe(123);
    });

    it('возвращает ID созданного чата', async () => {
      mockHttpClient.post.mockResolvedValue({ id: 999 });

      const result = await chatService.createChat('Test');

      expect(result).toEqual({ id: 999 });
    });

    it('отправляет корректный payload', async () => {
      mockHttpClient.post.mockResolvedValue({ id: 1 });

      await chatService.createChat('My Chat');

      expect(mockHttpClient.post).toHaveBeenCalledWith('/chats', {
        title: 'My Chat',
      });
    });

    it('может создавать чаты с различными названиями', async () => {
      mockHttpClient.post.mockResolvedValue({ id: 1 });

      await chatService.createChat('Test Chat 1');
      expect(mockHttpClient.post).toHaveBeenCalledWith('/chats', { title: 'Test Chat 1' });

      mockHttpClient.post.mockResolvedValue({ id: 2 });
      await chatService.createChat('Test Chat 2');
      expect(mockHttpClient.post).toHaveBeenCalledWith('/chats', { title: 'Test Chat 2' });
    });
  });

  describe('deleteChat метод', () => {
    it('удаляет чат по ID', async () => {
      mockHttpClient.delete.mockResolvedValue(undefined);

      await chatService.deleteChat(123);

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/chats', { chatId: 123 });
    });

    it('отправляет корректный chatId', async () => {
      mockHttpClient.delete.mockResolvedValue(undefined);

      await chatService.deleteChat(999);

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/chats', { chatId: 999 });
    });

    it('возвращает undefined', async () => {
      mockHttpClient.delete.mockResolvedValue(undefined);

      const result = await chatService.deleteChat(1);

      expect(result).toBeUndefined();
    });
  });

  describe('getChatUsers метод', () => {
    it('получает пользователей чата', async () => {
      const mockUsers = [
        createMockChatUser({ id: 1, login: 'user1' }),
        createMockChatUser({ id: 2, login: 'user2' }),
      ];
      mockHttpClient.get.mockResolvedValue(mockUsers);

      const result = await chatService.getChatUsers(123);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/chats/123/users');
      expect(result).toEqual(mockUsers);
    });

    it('использует правильный путь с ID чата', async () => {
      mockHttpClient.get.mockResolvedValue([]);

      await chatService.getChatUsers(456);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/chats/456/users');
    });

    it('возвращает пустой массив если пользователей нет', async () => {
      mockHttpClient.get.mockResolvedValue([]);

      const result = await chatService.getChatUsers(123);

      expect(result).toEqual([]);
    });

    it('возвращает пользователей с корректной структурой', async () => {
      const mockUsers = [
        createMockChatUser({
          id: 42,
          first_name: 'John',
          login: 'johndoe',
          avatar: 'https://example.com/john.jpg',
        }),
      ];
      mockHttpClient.get.mockResolvedValue(mockUsers);

      const result = await chatService.getChatUsers(1);

      expect(result[0].id).toBe(42);
      expect(result[0].first_name).toBe('John');
      expect(result[0].login).toBe('johndoe');
    });
  });

  describe('addUsers метод', () => {
    it('добавляет пользователей в чат', async () => {
      mockHttpClient.put.mockResolvedValue(undefined);

      await chatService.addUsers(123, [1, 2, 3]);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/chats/users', {
        users: [1, 2, 3],
        chatId: 123,
      });
    });

    it('отправляет корректный payload с одним пользователем', async () => {
      mockHttpClient.put.mockResolvedValue(undefined);

      await chatService.addUsers(456, [789]);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/chats/users', {
        users: [789],
        chatId: 456,
      });
    });

    it('отправляет корректный payload с несколькими пользователями', async () => {
      mockHttpClient.put.mockResolvedValue(undefined);

      await chatService.addUsers(1, [10, 20, 30, 40]);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/chats/users', {
        users: [10, 20, 30, 40],
        chatId: 1,
      });
    });

    it('возвращает undefined', async () => {
      mockHttpClient.put.mockResolvedValue(undefined);

      const result = await chatService.addUsers(1, [2, 3]);

      expect(result).toBeUndefined();
    });
  });

  describe('removeUsers метод', () => {
    it('удаляет пользователей из чата', async () => {
      mockHttpClient.delete.mockResolvedValue(undefined);

      await chatService.removeUsers(123, [1, 2]);

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/chats/users', {
        users: [1, 2],
        chatId: 123,
      });
    });

    it('отправляет корректный payload с одним пользователем', async () => {
      mockHttpClient.delete.mockResolvedValue(undefined);

      await chatService.removeUsers(456, [789]);

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/chats/users', {
        users: [789],
        chatId: 456,
      });
    });

    it('отправляет корректный payload с несколькими пользователями', async () => {
      mockHttpClient.delete.mockResolvedValue(undefined);

      await chatService.removeUsers(1, [10, 20, 30]);

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/chats/users', {
        users: [10, 20, 30],
        chatId: 1,
      });
    });

    it('возвращает undefined', async () => {
      mockHttpClient.delete.mockResolvedValue(undefined);

      const result = await chatService.removeUsers(1, [2]);

      expect(result).toBeUndefined();
    });
  });

  describe('Обработка ошибок', () => {
    it('пробрасывает ошибку при неудачном getChats', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'));

      await expect(chatService.getChats()).rejects.toThrow('Network error');
    });

    it('пробрасывает ошибку при неудачном createChat', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Server error'));

      await expect(chatService.createChat('Test')).rejects.toThrow('Server error');
    });

    it('пробрасывает ошибку при неудачном deleteChat', async () => {
      mockHttpClient.delete.mockRejectedValue(new Error('Server error'));

      await expect(chatService.deleteChat(123)).rejects.toThrow('Server error');
    });

    it('пробрасывает ошибку при неудачном getChatUsers', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'));

      await expect(chatService.getChatUsers(123)).rejects.toThrow('Network error');
    });

    it('пробрасывает ошибку при неудачном addUsers', async () => {
      mockHttpClient.put.mockRejectedValue(new Error('Server error'));

      await expect(chatService.addUsers(123, [1])).rejects.toThrow('Server error');
    });

    it('пробрасывает ошибку при неудачном removeUsers', async () => {
      mockHttpClient.delete.mockRejectedValue(new Error('Server error'));

      await expect(chatService.removeUsers(123, [1])).rejects.toThrow('Server error');
    });
  });

  describe('Интеграция методов', () => {
    it('создаёт чат, получает пользователей, добавляет новых', async () => {
      mockHttpClient.post.mockResolvedValueOnce({ id: 123 });
      mockHttpClient.get.mockResolvedValueOnce([
        createMockChatUser({ id: 1 }),
      ]);
      mockHttpClient.put.mockResolvedValueOnce(undefined);

      const createResult = await chatService.createChat('New Chat');
      expect(createResult.id).toBe(123);

      const users = await chatService.getChatUsers(123);
      expect(users).toHaveLength(1);

      await chatService.addUsers(123, [2, 3]);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/chats/users', {
        users: [2, 3],
        chatId: 123,
      });
    });

    it('добавляет и удаляет пользователей из чата', async () => {
      mockHttpClient.put.mockResolvedValueOnce(undefined);
      mockHttpClient.delete.mockResolvedValueOnce(undefined);

      await chatService.addUsers(1, [2, 3]);
      expect(mockHttpClient.put).toHaveBeenCalledWith('/chats/users', {
        users: [2, 3],
        chatId: 1,
      });

      await chatService.removeUsers(1, [2]);
      expect(mockHttpClient.delete).toHaveBeenCalledWith('/chats/users', {
        users: [2],
        chatId: 1,
      });
    });
  });
});
