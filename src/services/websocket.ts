import { chatService } from './chat';

export interface ServerMessage {
  id?: string | number;
  user_id: string | number;
  content: string;
  type: 'message';
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected';

interface ConnectionHandlers {
  onState: (state: ConnectionState, message: string) => void;
  onMessages: (messages: ServerMessage[], history: boolean) => void;
}

function isServerMessage(value: unknown): value is ServerMessage {
  if (!value || typeof value !== 'object') return false;
  if (!('type' in value) || value.type !== 'message') return false;
  if (!('content' in value) || typeof value.content !== 'string') return false;
  if (!('user_id' in value) || (typeof value.user_id !== 'string' && typeof value.user_id !== 'number')) return false;
  return !('id' in value) || typeof value.id === 'string' || typeof value.id === 'number';
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private generation = 0;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private timeout: ReturnType<typeof setTimeout> | null = null;

  async connect(chatId: number, userId: number, handlers: ConnectionHandlers): Promise<void> {
    this.disconnect();
    const generation = this.generation;
    handlers.onState('connecting', 'Connecting...');

    try {
      const { token } = await chatService.getMessagesToken(chatId);
      if (generation !== this.generation) return;
      if (typeof token !== 'string' || !token) throw new Error('Invalid chat connection token');

      const socket = new WebSocket(
        `wss://ya-praktikum.tech/ws/chats/${userId}/${chatId}/${encodeURIComponent(token)}`,
      );
      this.socket = socket;

      const fail = (message: string) => {
        if (generation !== this.generation) return;
        this.disconnect();
        handlers.onState('disconnected', `${message} Select the chat to retry.`);
      };

      this.timeout = setTimeout(() => fail('Connection timed out.'), 10000);
      socket.onopen = () => {
        if (generation !== this.generation) return;
        if (this.timeout !== null) clearTimeout(this.timeout);
        this.timeout = null;
        handlers.onState('connected', 'Connected');
        socket.send(JSON.stringify({ type: 'get old', content: '0' }));
        this.heartbeat = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'ping' }));
        }, 30000);
      };
      socket.onmessage = (event: MessageEvent<unknown>) => {
        if (generation !== this.generation) return;
        let data: unknown;
        try {
          if (typeof event.data !== 'string') throw new Error('Unexpected message format');
          data = JSON.parse(event.data);
        } catch (error) {
          console.error('Could not process chat message:', error);
          return;
        }
        if (Array.isArray(data)) {
          handlers.onMessages(data.filter(isServerMessage), true);
        } else if (isServerMessage(data)) {
          handlers.onMessages([data], false);
        } else if (data && typeof data === 'object' && 'type' in data && data.type === 'error') {
          fail('Chat server rejected the request.');
        } else if (data && typeof data === 'object' && 'type' in data
          && (data.type === 'pong' || data.type === 'user connected'
            || data.type === 'file' || data.type === 'sticker')) {
          return;
        } else {
          console.error('Unexpected chat message:', data);
        }
      };
      socket.onerror = () => fail('Could not connect to chat.');
      socket.onclose = () => fail('Chat connection closed.');
    } catch (error) {
      if (generation !== this.generation) return;
      console.error('Could not connect to chat:', error);
      handlers.onState('disconnected', 'Could not connect to chat. Select the chat to retry.');
    }
  }

  sendMessage(text: string): void {
    if (!/\S/.test(text)) throw new Error('Message must not be empty');
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Chat is not connected');
    }
    this.socket.send(JSON.stringify({ type: 'message', content: text }));
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    this.generation += 1;
    if (this.timeout !== null) clearTimeout(this.timeout);
    if (this.heartbeat !== null) clearInterval(this.heartbeat);
    this.timeout = null;
    this.heartbeat = null;
    const socket = this.socket;
    this.socket = null;
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
  }
}

export const websocketService = new WebSocketService();
