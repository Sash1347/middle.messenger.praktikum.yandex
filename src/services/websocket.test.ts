import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chatService } from './chat';
import { websocketService } from './websocket';

vi.mock('./chat', () => ({
  chatService: { getMessagesToken: vi.fn() },
}));

class MockWebSocket {
  static OPEN = 1;
  static CLOSING = 2;
  static instances: MockWebSocket[] = [];
  readyState = 0;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  url: string;
  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSING;
    this.onclose?.();
  });

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }
}

describe('chat WebSocket', () => {
  const handlers = { onState: vi.fn(), onMessages: vi.fn() };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('WebSocket', MockWebSocket);
    MockWebSocket.instances = [];
    vi.clearAllMocks();
    vi.mocked(chatService.getMessagesToken).mockResolvedValue({ token: 'test-token' });
  });

  afterEach(() => {
    websocketService.disconnect();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('authenticates, loads history, sends messages, receives messages, and pings', async () => {
    await websocketService.connect(4, 7, handlers);
    const socket = MockWebSocket.instances[0];
    expect(chatService.getMessagesToken).toHaveBeenCalledWith(4);
    expect(socket.url).toBe('wss://ya-praktikum.tech/ws/chats/7/4/test-token');
    expect(() => websocketService.sendMessage('hello')).toThrow('not connected');
    socket.open();
    expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ type: 'get old', content: '0' }));
    websocketService.sendMessage('hello');
    expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ type: 'message', content: 'hello' }));
    const message = { id: 1, user_id: 7, type: 'message', content: 'hello' };
    socket.onmessage?.({ data: JSON.stringify([message]) });
    socket.onmessage?.({ data: JSON.stringify(message) });
    socket.onmessage?.({ data: JSON.stringify({ type: 'pong' }) });
    expect(handlers.onMessages).toHaveBeenNthCalledWith(1, [message], true);
    expect(handlers.onMessages).toHaveBeenNthCalledWith(2, [message], false);
    expect(handlers.onMessages).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(30000);
    expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ type: 'ping' }));
    websocketService.disconnect();
    expect(socket.close).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(30000);
    expect(socket.send).toHaveBeenCalledTimes(3);
  });

  it('ignores a token response for a chat that is no longer selected', async () => {
    let resolveToken: (response: { token: string }) => void = () => {
      throw new Error('Token resolver not initialized');
    };
    vi.mocked(chatService.getMessagesToken).mockReturnValueOnce(
      new Promise((resolve) => { resolveToken = resolve; }),
    );
    const first = websocketService.connect(1, 7, handlers);
    await websocketService.connect(2, 7, handlers);
    resolveToken({ token: 'old-token' });
    await first;
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toContain('/7/2/');
  });

  it('reports a timeout and leaves sending disabled', async () => {
    await websocketService.connect(4, 7, handlers);
    vi.advanceTimersByTime(10000);
    expect(handlers.onState).toHaveBeenLastCalledWith(
      'disconnected', 'Connection timed out. Select the chat to retry.',
    );
    expect(MockWebSocket.instances[0].close).toHaveBeenCalledOnce();
    expect(websocketService.isConnected()).toBe(false);
  });

  it('reports connection failures and ignores events after disconnect', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(chatService.getMessagesToken).mockRejectedValueOnce(new Error('Unauthorized'));
    await websocketService.connect(4, 7, handlers);
    expect(handlers.onState).toHaveBeenLastCalledWith(
      'disconnected', 'Could not connect to chat. Select the chat to retry.',
    );
    expect(MockWebSocket.instances).toHaveLength(0);

    await websocketService.connect(4, 7, handlers);
    const socket = MockWebSocket.instances[0];
    socket.open();
    socket.onerror?.();
    expect(handlers.onState).toHaveBeenLastCalledWith(
      'disconnected', 'Could not connect to chat. Select the chat to retry.',
    );
    socket.onmessage?.({ data: JSON.stringify({ type: 'message', user_id: 7, content: 'late' }) });
    expect(handlers.onMessages).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
