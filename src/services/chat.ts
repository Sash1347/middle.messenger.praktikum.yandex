import { httpClient } from '../utils/http';

export interface ChatData {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
}

export interface ChatUser {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  avatar: string | null;
}

interface CreateChatResponse {
  id: number;
}

class ChatService {
  getChats(): Promise<ChatData[]> {
    return httpClient.get<ChatData[]>('/chats');
  }

  getMessagesToken(chatId: number): Promise<{ token: string }> {
    return httpClient.post<{ token: string }>(`/chats/token/${chatId}`);
  }

  createChat(title: string): Promise<CreateChatResponse> {
    return httpClient.post<CreateChatResponse>('/chats', { title });
  }

  updateAvatar(chatId: number, avatar: File): Promise<ChatData> {
    const data = new FormData();
    data.append('chatId', String(chatId));
    data.append('avatar', avatar);
    return httpClient.put<ChatData>('/chats/avatar', data);
  }

  deleteChat(chatId: number): Promise<void> {
    return httpClient.delete<void>('/chats', { chatId });
  }

  async getChatUsers(chatId: number): Promise<ChatUser[]> {
    const users: ChatUser[] = [];
    const limit = 20;
    let page: ChatUser[];
    do {
      page = await httpClient.get<ChatUser[]>(`/chats/${chatId}/users`, {
        offset: String(users.length),
        limit: String(limit),
      });
      users.push(...page);
    } while (page.length === limit);
    return users;
  }

  addUsers(chatId: number, users: number[]): Promise<void> {
    return httpClient.put<void>('/chats/users', { users, chatId });
  }

  removeUsers(chatId: number, users: number[]): Promise<void> {
    return httpClient.delete<void>('/chats/users', { users, chatId });
  }
}

export const chatService = new ChatService();
