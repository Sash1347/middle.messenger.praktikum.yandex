import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RenderMainContent from './index';
import { chatModel } from '../../models/chat';
import { chatService, type ChatData } from '../../services/chat';
import { websocketService } from '../../services/websocket';
import { showMembersPopup, showErrorPopup, showConfirmPopup, showCreateChatPopup } from '../../utils/popup';
import { authService, type UserData } from '../../utils/auth';

vi.mock('../../services/chat', () => ({
  chatService: {
    getChats: vi.fn(),
    getChatUsers: vi.fn().mockResolvedValue([]),
    createChat: vi.fn(),
    updateAvatar: vi.fn(),
    deleteChat: vi.fn().mockResolvedValue(undefined),
    removeUsers: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../utils/auth', () => ({
  authService: {
    getAuthUser: vi.fn(() => ({ id: 7 })),
    getUser: vi.fn().mockResolvedValue({ id: 7, avatar: null }),
  },
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
  isSupportedChatImage: (file: File) => !file.type || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
  showConfirmPopup: vi.fn().mockResolvedValue(true),
  showCreateChatPopup: vi.fn(),
  showErrorPopup: vi.fn().mockResolvedValue(undefined),
  showMembersPopup: vi.fn().mockResolvedValue(null),
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
    vi.mocked(chatService.getChatUsers).mockReset().mockResolvedValue([]);
    vi.mocked(showMembersPopup).mockReset().mockResolvedValue(null);
    vi.mocked(showConfirmPopup).mockReset().mockResolvedValue(true);
    vi.mocked(showCreateChatPopup).mockReset().mockResolvedValue(null);
    vi.mocked(chatService.createChat).mockReset().mockResolvedValue({ id: 3 });
    vi.mocked(chatService.updateAvatar).mockReset();
    vi.mocked(authService.getUser).mockReset().mockResolvedValue({
      id: 7, first_name: 'Current', second_name: 'User', display_name: '', login: 'current',
      email: 'current@example.com', phone: '1234567890', avatar: null,
    });
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

  it('creates a chat with an optional image and selects it', async () => {
    const image = new File(['image'], 'chat.png', { type: 'image/png' });
    vi.mocked(showCreateChatPopup).mockResolvedValueOnce({ title: 'New', avatar: image });
    const created = { id: 3, title: 'New', avatar: '/new.png', unread_count: 0 };
    vi.mocked(chatService.updateAvatar).mockResolvedValueOnce(created);
    vi.mocked(chatService.getChats).mockResolvedValueOnce(chats).mockResolvedValueOnce([...chats, created]);
    const conversation = renderMain();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));
    document.querySelector<HTMLButtonElement>('.chat-layout__new-chat')?.click();
    await vi.waitFor(() => expect(chatService.updateAvatar).toHaveBeenCalledWith(3, image));
    await vi.waitFor(() => expect(conversation.querySelector('.dialog-header__name')?.textContent).toBe('New'));
    expect(conversation.querySelector<HTMLImageElement>('.dialog-header__avatar-image')?.src).toContain('/resources/new.png');
    expect(document.querySelectorAll('.chat-card__avatar-image')).toHaveLength(1);
  });

  it('creates a chat without uploading an image and reports upload failures after creation', async () => {
    const created = { id: 3, title: 'New', avatar: null, unread_count: 0 };
    vi.mocked(showCreateChatPopup).mockResolvedValueOnce({ title: 'New', avatar: null });
    vi.mocked(chatService.getChats).mockResolvedValueOnce(chats).mockResolvedValueOnce([...chats, created]);
    renderMain();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));
    document.querySelector<HTMLButtonElement>('.chat-layout__new-chat')?.click();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(3));
    expect(chatService.updateAvatar).not.toHaveBeenCalled();
    expect(document.querySelector<HTMLImageElement>('.dialog-header__avatar-image')?.hidden).toBe(true);

    const image = new File(['image'], 'chat.png', { type: 'image/png' });
    vi.mocked(showCreateChatPopup).mockResolvedValueOnce({ title: 'New', avatar: image });
    vi.mocked(chatService.updateAvatar).mockRejectedValueOnce(new Error('Upload failed'));
    await vi.waitFor(() => expect(document.querySelector<HTMLButtonElement>('.chat-layout__new-chat')?.disabled).toBe(false));
    document.querySelector<HTMLButtonElement>('.chat-layout__new-chat')?.click();
    await vi.waitFor(() => expect(showErrorPopup).toHaveBeenCalledWith(expect.stringContaining('Chat created, but the image could not be uploaded')));
  });

  it('updates the chosen chat image without changing another selected chat', async () => {
    const image = new File(['image'], 'chat.png', { type: 'image/png' });
    let finishUpload: (chat: ChatData) => void = () => { throw new Error('Not initialized'); };
    vi.mocked(chatService.updateAvatar).mockImplementationOnce(() => new Promise((resolve) => { finishUpload = resolve; }));
    const conversation = renderMain();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));
    document.querySelector<HTMLButtonElement>('.chat-card')?.click();
    const input = conversation.querySelector<HTMLInputElement>('.dialog-header__avatar-input');
    if (!input) throw new Error('Avatar input missing');
    conversation.querySelector<HTMLButtonElement>('.dialog-header__avatar')?.click();
    Object.defineProperty(input, 'files', { configurable: true, value: [image] });
    input.dispatchEvent(new Event('change'));
    expect(chatService.updateAvatar).toHaveBeenCalledWith(1, image);
    document.querySelectorAll<HTMLButtonElement>('.chat-card')[1].click();
    finishUpload({ ...chats[0], avatar: '/new.png' });
    await vi.waitFor(() => expect(document.querySelector('.chat-card__avatar-image')).not.toBeNull());
    expect(conversation.querySelector('.dialog-header__name')?.textContent).toBe('Second');
    expect(conversation.querySelector<HTMLImageElement>('.dialog-header__avatar-image')?.hidden).toBe(true);
    document.querySelector<HTMLButtonElement>('.chat-card')?.click();
    expect(conversation.querySelector<HTMLImageElement>('.dialog-header__avatar-image')?.src).toContain('/resources/new.png');
  });

  it('updates the current header image and falls back to a circle when it fails to load', async () => {
    const image = new File(['image'], 'chat.png', { type: 'image/png' });
    vi.mocked(chatService.updateAvatar).mockResolvedValueOnce({ ...chats[0], avatar: '/new.png' });
    const conversation = renderMain();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));
    document.querySelector<HTMLButtonElement>('.chat-card')?.click();
    const input = conversation.querySelector<HTMLInputElement>('.dialog-header__avatar-input');
    const avatar = conversation.querySelector<HTMLImageElement>('.dialog-header__avatar-image');
    if (!input || !avatar) throw new Error('Avatar controls missing');
    conversation.querySelector<HTMLButtonElement>('.dialog-header__avatar')?.click();
    Object.defineProperty(input, 'files', { configurable: true, value: [image] });
    input.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(avatar.src).toContain('/resources/new.png'));
    expect(avatar.hidden).toBe(false);
    avatar.dispatchEvent(new Event('error'));
    expect(avatar.hidden).toBe(true);
  });

  it('reports an image upload failure without changing the chat image', async () => {
    vi.mocked(chatService.updateAvatar).mockRejectedValueOnce(new Error('Upload failed'));
    const conversation = renderMain();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));
    document.querySelector<HTMLButtonElement>('.chat-card')?.click();
    const input = conversation.querySelector<HTMLInputElement>('.dialog-header__avatar-input');
    if (!input) throw new Error('Avatar input missing');
    conversation.querySelector<HTMLButtonElement>('.dialog-header__avatar')?.click();
    Object.defineProperty(input, 'files', { configurable: true, value: [new File(['x'], 'chat.png', { type: 'image/png' })] });
    input.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(showErrorPopup).toHaveBeenCalledWith(expect.stringContaining('Upload failed')));
    expect(conversation.querySelector<HTMLImageElement>('.dialog-header__avatar-image')?.hidden).toBe(true);
    expect(conversation.querySelector<HTMLButtonElement>('.dialog-header__avatar')?.disabled).toBe(false);
  });

  it('shows chat members with names and avatars and removes the selected member', async () => {
    const members = [
      { id: 8, first_name: 'Alice', second_name: 'Smith', display_name: null, login: 'alice', avatar: '/alice.png' },
      { id: 9, first_name: 'Bob', second_name: 'Jones', display_name: 'Bobby', login: 'bob', avatar: null },
    ];
    vi.mocked(chatService.getChatUsers).mockResolvedValue(members);
    const conversation = renderMain();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));
    document.querySelector<HTMLButtonElement>('.chat-card')?.click();
    await vi.waitFor(() => expect(conversation.querySelector('.dialog-header__users')?.textContent).toBe('2 members'));
    conversation.querySelector<HTMLButtonElement>('.dialog-header__users')?.click();
    await vi.waitFor(() => expect(showMembersPopup).toHaveBeenCalled());
    const [displayed, currentUserId] = vi.mocked(showMembersPopup).mock.calls[0];
    expect(displayed).toEqual([
      { id: 8, name: 'Alice Smith', login: 'alice', avatar: 'https://ya-praktikum.tech/api/v2/resources/alice.png' },
      { id: 9, name: 'Bobby', login: 'bob', avatar: null },
    ]);
    expect(currentUserId).toBe(7);
    await vi.waitFor(() => expect(conversation.querySelector<HTMLButtonElement>('.dialog-header__users')?.disabled).toBe(false));
    expect(conversation.querySelector('.dialog-header__remove-user')).toBeNull();
    vi.mocked(showMembersPopup).mockResolvedValueOnce(8);
    conversation.querySelector<HTMLButtonElement>('.dialog-header__users')?.click();
    await vi.waitFor(() => expect(chatService.removeUsers).toHaveBeenCalledWith(1, [8]));
    expect(showConfirmPopup).toHaveBeenCalledWith('Remove member', expect.stringContaining('Alice Smith (@alice)'));
  });

  it('does not remove a member after switching chats during selection', async () => {
    let resolveSelection: (id: number | null) => void = () => { throw new Error('Not initialized'); };
    vi.mocked(showMembersPopup).mockImplementationOnce(() => new Promise((resolve) => { resolveSelection = resolve; }));
    renderMain();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));
    document.querySelector<HTMLButtonElement>('.chat-card')?.click();
    document.querySelector<HTMLButtonElement>('.dialog-header__users')?.click();
    await vi.waitFor(() => expect(showMembersPopup).toHaveBeenCalled());
    document.querySelectorAll<HTMLButtonElement>('.chat-card')[1].click();
    resolveSelection(8);
    await Promise.resolve();
    expect(chatService.removeUsers).not.toHaveBeenCalled();
  });

  it('uses the latest profile avatar when the chat member has none', async () => {
    const profile: UserData = {
      id: 7, first_name: 'Current', second_name: 'User', display_name: '', login: 'current',
      email: 'current@example.com', phone: '1234567890', avatar: '/my-avatar.png',
    };
    vi.mocked(authService.getUser).mockResolvedValue(profile);
    vi.mocked(chatService.getChatUsers).mockResolvedValue([
      { id: 7, first_name: 'Current', second_name: 'User', display_name: null, login: 'current', avatar: null },
      { id: 8, first_name: 'Alice', second_name: 'Smith', display_name: null, login: 'alice', avatar: '/alice.png' },
      { id: 9, first_name: 'Bob', second_name: 'Jones', display_name: null, login: 'bob', avatar: null },
    ]);
    renderMain();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));
    document.querySelector<HTMLButtonElement>('.chat-card')?.click();
    document.querySelector<HTMLButtonElement>('.dialog-header__users')?.click();
    await vi.waitFor(() => expect(showMembersPopup).toHaveBeenCalled());
    const members = vi.mocked(showMembersPopup).mock.calls[0][0];
    expect(members.map((member) => member.avatar)).toEqual([
      'https://ya-praktikum.tech/api/v2/resources/my-avatar.png',
      'https://ya-praktikum.tech/api/v2/resources/alice.png',
      null,
    ]);
  });

  it('rejects attempts to remove the current user', async () => {
    vi.mocked(showMembersPopup).mockResolvedValueOnce(7);
    vi.mocked(chatService.getChatUsers).mockResolvedValue([
      { id: 7, first_name: 'Current', second_name: 'User', display_name: null, login: 'current', avatar: null },
    ]);
    const conversation = renderMain();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));
    document.querySelector<HTMLButtonElement>('.chat-card')?.click();
    conversation.querySelector<HTMLButtonElement>('.dialog-header__users')?.click();
    await vi.waitFor(() => expect(showErrorPopup).toHaveBeenCalledWith(expect.stringContaining('cannot remove yourself')));
    expect(chatService.removeUsers).not.toHaveBeenCalled();
    expect(showConfirmPopup).not.toHaveBeenCalled();
    expect(conversation.hidden).toBe(false);
  });

  it('reports member loading failures', async () => {
    const conversation = renderMain();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));
    document.querySelector<HTMLButtonElement>('.chat-card')?.click();
    await vi.waitFor(() => expect(conversation.querySelector('.dialog-header__users')?.textContent).toBe('0 members'));
    vi.mocked(chatService.getChatUsers).mockRejectedValueOnce(new Error('Network error'));
    conversation.querySelector<HTMLButtonElement>('.dialog-header__users')?.click();
    await vi.waitFor(() => expect(showErrorPopup).toHaveBeenCalledWith(expect.stringContaining('Network error')));
    expect(chatService.removeUsers).not.toHaveBeenCalled();
  });

  it('does not remove a member when confirmation is cancelled', async () => {
    vi.mocked(chatService.getChatUsers).mockResolvedValue([
      { id: 8, first_name: 'Alice', second_name: 'Smith', display_name: null, login: 'alice', avatar: null },
    ]);
    vi.mocked(showMembersPopup).mockResolvedValueOnce(8);
    vi.mocked(showConfirmPopup).mockResolvedValueOnce(false);
    renderMain();
    await vi.waitFor(() => expect(document.querySelectorAll('.chat-card')).toHaveLength(2));
    document.querySelector<HTMLButtonElement>('.chat-card')?.click();
    document.querySelector<HTMLButtonElement>('.dialog-header__users')?.click();
    await vi.waitFor(() => expect(showConfirmPopup).toHaveBeenCalled());
    expect(chatService.removeUsers).not.toHaveBeenCalled();
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
    expect(button?.disabled).toBe(true);

    let input = conversation.querySelector<HTMLInputElement>('input[name="message"]');
    if (!input) throw new Error('Message input not found');
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(conversation.querySelector('#message_error')?.textContent).toBe('');
    input.value = '   ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(button?.disabled).toBe(true);
    expect(conversation.querySelector('#message_error')?.textContent).toBe('');
    input.value = 'draft';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(button?.disabled).toBe(false);
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
    expect(button?.disabled).toBe(true);
    expect(conversation.querySelectorAll('.message')).toHaveLength(2);
    handlers.onMessages([{ id: 3, user_id: '7', content: 'draft', type: 'message' }], false);
    expect(conversation.querySelectorAll('.message')).toHaveLength(3);
    expect(conversation.querySelector('.message--outgoing')?.textContent).toContain('Earlier');
  });
});
