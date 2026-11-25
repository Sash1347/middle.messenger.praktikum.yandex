export interface ChatMessage {
  text: string;
  direction: 'outgoing' | 'incoming';
  id?: string;
}

const STORAGE_PREFIX = 'chat_messages_';
const LEGACY_STORAGE_KEY = 'chat_messages';

class ChatModel {
  private activeChatId: number | null = null;
  private messages: ChatMessage[] = [];

  selectChat(chatId: number): void {
    this.activeChatId = chatId;
    this.messages = this.restoreMessages(this.getStorageKey(chatId));
  }

  private restoreMessages(storageKey: string): ChatMessage[] {
    const stored = sessionStorage.getItem(storageKey);
    if (!stored) return [];

    try {
      const messages: unknown = JSON.parse(stored);
      if (Array.isArray(messages) && messages.every((message) => (
        message && typeof message === 'object'
        && 'text' in message && typeof message.text === 'string'
        && 'direction' in message
        && (message.direction === 'outgoing' || message.direction === 'incoming')
      ))) {
        return messages as ChatMessage[];
      }
    } catch {
      sessionStorage.removeItem(storageKey);
      return [];
    }

    sessionStorage.removeItem(storageKey);
    return [];
  }

  private getStorageKey(chatId: number): string {
    return `${STORAGE_PREFIX}${chatId}`;
  }

  getMessages(): ChatMessage[] {
    return this.messages.map((message) => ({ ...message }));
  }

  deselectChat(): void {
    this.activeChatId = null;
    this.messages = [];
  }

  setMessages(messages: ChatMessage[]): void {
    if (this.activeChatId === null) throw new Error('Select a chat before sending a message');
    const seen = new Set<string>();
    this.messages = messages.filter((message) => {
      if (message.id === undefined) return true;
      if (seen.has(message.id)) return false;
      seen.add(message.id);
      return true;
    });
    sessionStorage.setItem(this.getStorageKey(this.activeChatId), JSON.stringify(this.messages));
  }

  addMessage(message: ChatMessage): void {
    this.setMessages([...this.messages, message]);
  }

  clearChat(chatId: number): void {
    sessionStorage.removeItem(this.getStorageKey(chatId));
    if (this.activeChatId === chatId) this.messages = [];
  }

  clear(): void {
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(STORAGE_PREFIX)) sessionStorage.removeItem(key);
    }
    this.activeChatId = null;
    this.messages = [];
  }
}

sessionStorage.removeItem(LEGACY_STORAGE_KEY);

export const chatModel = new ChatModel();
