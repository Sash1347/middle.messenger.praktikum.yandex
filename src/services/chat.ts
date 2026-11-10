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

  createChat(title: string): Promise<CreateChatResponse> {
    return httpClient.post<CreateChatResponse>('/chats', { title });
  }

  deleteChat(chatId: number): Promise<void> {
    return httpClient.delete<void>('/chats', { chatId });
  }

  getChatUsers(chatId: number): Promise<ChatUser[]> {
    return httpClient.get<ChatUser[]>(`/chats/${chatId}/users`);
  }

  addUsers(chatId: number, users: number[]): Promise<void> {
    return httpClient.put<void>('/chats/users', { users, chatId });
  }

  removeUsers(chatId: number, users: number[]): Promise<void> {
    return httpClient.delete<void>('/chats/users', { users, chatId });
  }
}

export const chatService = new ChatService();