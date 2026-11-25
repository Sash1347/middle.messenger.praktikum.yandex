import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RenderMainContent from './index';
import { chatModel } from '../../models/chat';
import { chatService } from '../../services/chat';
import { websocketService } from '../../services/websocket';

vi.mock('../../services/chat', () => ({
  chatService: {
    getChats: vi.fn(),
    getChatUsers: vi.fn().mockResolvedValue([]),
    deleteChat: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../utils/auth', () => ({
  authService: { getAuthUser: vi.fn(() => ({ id: 7 })) },
}));

vi.mock('../../services/websocket', () => ({
  websocketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    isConnected: vi.fn(() => false),
    sendMessage: vi.fn(),
  },
}));

vi.mock('../../router/router', () => ({ navigate: vi.fn() }));
vi.mock('../../utils/popup.ts', () => ({
  showConfirmPopup: vi.fn().mockResolvedValue(true),
  showErrorPopup: vi.fn().mockResolvedValue(undefined),
  showPromptPopup: vi.fn(),
  showSuccessPopup: vi.fn().mockResolvedValue(undefined),
}));

const chats = [
  { id: 1, title: 'First', avatar: null, unread_count: 0 },
  { id: 2, title: 'Second', avatar: null, unread_count: 0 },
];

let cleanup: (() => void) | undefined;

function renderMain() {
  cleanup = RenderMainContent((content) => {
    document.body.replaceChildren(content);
  });
  const conversation = document.querySelector<HTMLElement>('.chat-layout__conversation');
  if (!conversation) throw new Error('Conversation not found');
  return conversation;
}

describe('chat selection', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    chatModel.clear();
    vi.clearAllMocks();
    vi.mocked(chatService.getChats).mockResolvedValue(chats);
    vi.mocked(websocketService.isConnected).mockReturnValue(false);
  });

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
  });

  it('hides the conversation until a chat is clicked and allows switching chats', async () => {
    chatModel.selectChat(99);
    const conversation = renderMain();
    expect(conversation.hidden).toBe(true);

    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));
    expect(conversation.hidden).toBe(true);
    expect(chatService.getChatUsers).not.toHaveBeenCalled();

    const cards = document.querySelectorAll<HTMLButtonElement>('.chat-card');
    cards[0].click();
    expect(conversation.hidden).toBe(false);
    expect(conversation.querySelector('.dialog-header__name')?.textContent).toBe('First');
    expect(conversation.querySelector('input[name="message"]')).not.toBeNull();
    expect(conversation.querySelector('button[type="submit"]')?.textContent).toContain('Send');

    document.querySelectorAll<HTMLButtonElement>('.chat-card')[1].click();
    expect(conversation.hidden).toBe(false);
    expect(conversation.querySelector('.dialog-header__name')?.textContent).toBe('Second');
  });

  it('hides the conversation after deleting the selected chat', async () => {
    vi.mocked(chatService.getChats).mockResolvedValueOnce(chats).mockResolvedValueOnce([chats[1]]);
    const conversation = renderMain();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));

    document.querySelector<HTMLButtonElement>('.chat-card')?.click();
    conversation.querySelector<HTMLButtonElement>('.dialog-header__delete')?.click();

    await vi.waitFor(() => expect(chatService.deleteChat).toHaveBeenCalledWith(1));
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(1));
    expect(conversation.hidden).toBe(true);
  });

  it('sends through the connection and displays server messages without losing a draft', async () => {
    const conversation = renderMain();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));
    document.querySelector<HTMLButtonElement>('.chat-card')?.click();

    const handlers = vi.mocked(websocketService.connect).mock.calls[0][2];
    let button = conversation.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(button?.disabled).toBe(true);
    vi.mocked(websocketService.isConnected).mockReturnValue(true);
    handlers.onState('connected', 'Connected');
    expect(button?.disabled).toBe(false);

    let input = conversation.querySelector<HTMLInputElement>('input[name="message"]');
    if (!input) throw new Error('Message input not found');
    input.value = 'draft';
    handlers.onMessages([{ id: 2, user_id: 8, content: 'Hello', type: 'message' }], false);
    input = conversation.querySelector<HTMLInputElement>('input[name="message"]');
    expect(input?.value).toBe('draft');
    expect(conversation.textContent).toContain('Hello');

    handlers.onMessages([
      { id: 2, user_id: 8, content: 'Hello', type: 'message' },
      { id: 1, user_id: 7, content: 'Earlier', type: 'message' },
    ], true);
    expect(conversation.querySelectorAll('.message')).toHaveLength(2);
    expect(conversation.textContent).toContain('Earlier');

    button = conversation.querySelector<HTMLButtonElement>('button[type="submit"]');
    button?.click();
    expect(websocketService.sendMessage).toHaveBeenCalledWith('draft');
    expect(conversation.querySelector<HTMLInputElement>('input[name="message"]')?.value).toBe('');
    expect(conversation.querySelectorAll('.message')).toHaveLength(2);
    handlers.onMessages([{ id: 3, user_id: '7', content: 'draft', type: 'message' }], false);
    expect(conversation.querySelectorAll('.message')).toHaveLength(3);
    expect(conversation.querySelector('.message--outgoing')?.textContent).toContain('Earlier');
  });
});
