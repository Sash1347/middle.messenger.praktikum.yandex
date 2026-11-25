import template from './index.hbs?raw';

import './components/profile-bar';
import './components/profile-edit';
import './components/dialog';
import { renderPage, type RenderContent } from '../render';
import './components/dialog/components/dialog-header';
import { authService } from '../../utils/auth';
import { navigate } from '../../router/router';
import { setButtonLoading } from '../../utils/buttonLoader';
import { chatModel, type ChatMessage } from '../../models/chat';
import ChatCard from './components/chat-card';
import { chatService, type ChatData } from '../../services/chat';
import { websocketService, type ServerMessage } from '../../services/websocket';
import DefaultAvatar from '../../assets/images/avatar.png';
import {
    showConfirmPopup,
    showErrorPopup,
    showPromptPopup,
    showSuccessPopup,
} from '../../utils/popup.ts';

import './index.scss';

export default function RenderMainContent(renderToHtml: RenderContent) {
    chatModel.deselectChat();
    const destroyPage = renderPage(template, {}, renderToHtml);

    const chatList = document.querySelector<HTMLElement>('.chat-layout__chats-list');
    const conversation = document.querySelector<HTMLElement>('.chat-layout__conversation');
    const connectionStatus = document.querySelector<HTMLElement>('.chat-layout__connection');
    const newChatButton = document.querySelector<HTMLButtonElement>('.chat-layout__new-chat');
    const addUserButton = document.querySelector<HTMLButtonElement>('.dialog-header__add-user');
    const removeUserButton = document.querySelector<HTMLButtonElement>('.dialog-header__remove-user');
    const deleteChatButton = document.querySelector<HTMLButtonElement>('.dialog-header__delete');
    const chatTitle = document.querySelector<HTMLElement>('.dialog-header__name');
    const chatUsers = document.querySelector<HTMLElement>('.dialog-header__users');
    const logoutButton = document.querySelector<HTMLButtonElement>('.btn-logout');

    let chats: ChatData[] = [];
    let selectedChat: ChatData | null = null;
    let chatCards: ChatCard[] = [];
    let active = true;

    const notifyDialog = (event: string) => {
        document.querySelector('.dialog')?.dispatchEvent(new Event(event));
    };

    const setConnectionStatus = (message: string) => {
        if (connectionStatus) connectionStatus.textContent = message;
        notifyDialog('chat:status');
    };

    const connectChat = (chat: ChatData) => {
        websocketService.disconnect();
        const user = authService.getAuthUser();
        if (!user) {
            setConnectionStatus('Could not identify the current user. Sign in again.');
            return;
        }

        const liveMessages: ChatMessage[] = [];
        let awaitingHistory = true;
        const toChatMessage = (message: ServerMessage): ChatMessage => ({
            text: message.content,
            direction: String(message.user_id) === String(user.id) ? 'outgoing' : 'incoming',
            ...(message.id !== undefined ? { id: String(message.id) } : {}),
        });

        void websocketService.connect(chat.id, user.id, {
            onState: (_state, message) => setConnectionStatus(message),
            onMessages: (messages, history) => {
                const converted = messages.map(toChatMessage);
                if (history) {
                    chatModel.setMessages([...converted.reverse(), ...liveMessages]);
                    awaitingHistory = false;
                    liveMessages.length = 0;
                } else {
                    if (awaitingHistory) liveMessages.push(...converted);
                    converted.forEach((message) => chatModel.addMessage(message));
                }
                notifyDialog('chat:messages');
            },
        });
    };

    const renderChatCards = () => {
        if (!chatList) return;
        chatCards.forEach((card) => card.destroy());
        chatCards = [];
        chatList.replaceChildren();

        if (chats.length === 0) {
            chatList.textContent = 'No chats';
            return;
        }

        chats.forEach((chat) => {
            const card = new ChatCard({
                id: chat.id,
                avatar: chat.avatar
                    ? `https://ya-praktikum.tech/api/v2/resources${chat.avatar}`
                    : DefaultAvatar,
                name: chat.title,
                selected: selectedChat?.id === chat.id,
                onSelect: (chatId) => {
                    const selected = chats.find((item) => item.id === chatId);
                    if (selected) void selectChat(selected);
                },
            });
            const element = card.element();
            if (element) chatList.append(element);
            chatCards.push(card);
        });
    };

    const setChatActionsEnabled = (enabled: boolean) => {
        if (addUserButton) addUserButton.disabled = !enabled;
        if (removeUserButton) removeUserButton.disabled = !enabled;
        if (deleteChatButton) deleteChatButton.disabled = !enabled;
    };

    const refreshChatUsers = async (chat: ChatData) => {
        try {
            const users = await chatService.getChatUsers(chat.id);
            if (selectedChat?.id === chat.id && chatUsers) {
                chatUsers.textContent = `${users.length} ${users.length === 1 ? 'member' : 'members'}`;
            }
        } catch (error) {
            await showErrorPopup(`Could not load chat members: ${getErrorMessage(error)}`);
        }
    };

    async function selectChat(chat: ChatData): Promise<void> {
        selectedChat = chat;
        chatModel.selectChat(chat.id);
        if (conversation) conversation.hidden = false;
        if (chatTitle) chatTitle.textContent = chat.title;
        if (chatUsers) chatUsers.textContent = 'Loading members...';
        setChatActionsEnabled(true);
        renderChatCards();
        notifyDialog('chat:selected');
        connectChat(chat);
        await refreshChatUsers(chat);
    }

    const loadChats = async (preferredChatId?: number) => {
        if (chatList) chatList.textContent = 'Loading chats...';
        setChatActionsEnabled(false);

        try {
            chats = await chatService.getChats();
            if (!active) return;
            selectedChat = chats.find((chat) => chat.id === preferredChatId)
                ?? chats.find((chat) => chat.id === selectedChat?.id)
                ?? null;
            renderChatCards();

            if (selectedChat) {
                await selectChat(selectedChat);
            } else {
                websocketService.disconnect();
                chatModel.deselectChat();
                if (conversation) conversation.hidden = true;
                if (chatTitle) chatTitle.textContent = 'Select a chat';
                if (chatUsers) chatUsers.textContent = '';
                notifyDialog('chat:selected');
            }
        } catch (error) {
            if (!active) return;
            if (chatList) chatList.textContent = 'Could not load chats.';
            await showErrorPopup(`Could not load chats: ${getErrorMessage(error)}`);
        }
    };

    newChatButton?.addEventListener('click', async () => {
        const title = (await showPromptPopup('New chat', 'Choose a name for this chat.'))?.trim();
        if (!title) return;

        try {
            const createdChat = await chatService.createChat(title);
            await loadChats(createdChat.id);
            await showSuccessPopup('Chat created.');
        } catch (error) {
            await showErrorPopup(`Could not create chat: ${getErrorMessage(error)}`);
        }
    });

    const changeChatUsers = async (action: 'add' | 'remove') => {
        if (!selectedChat) return;
        const enteredIds = await showPromptPopup(
            action === 'add' ? 'Add members' : 'Remove members',
            'Enter numeric user IDs separated by commas.',
        );
        if (enteredIds === null) return;

        const userIds = enteredIds.split(',').map((value: string) => Number(value.trim()));
        if (userIds.length === 0 || userIds.some((id: number) => !Number.isInteger(id) || id <= 0)) {
            await showErrorPopup('Enter one or more positive numeric user IDs.');
            return;
        }

        try {
            if (action === 'add') {
                await chatService.addUsers(selectedChat.id, userIds);
            } else {
                await chatService.removeUsers(selectedChat.id, userIds);
            }
            await refreshChatUsers(selectedChat);
            await showSuccessPopup(action === 'add' ? 'User(s) added.' : 'User(s) removed.');
        } catch (error) {
            await showErrorPopup(`Could not ${action} user(s): ${getErrorMessage(error)}`);
        }
    };

    addUserButton?.addEventListener('click', () => void changeChatUsers('add'));
    removeUserButton?.addEventListener('click', () => void changeChatUsers('remove'));

    deleteChatButton?.addEventListener('click', async () => {
        if (!selectedChat || !await showConfirmPopup(
            'Delete chat',
            `Delete "${selectedChat.title}"? This cannot be undone.`,
        )) return;

        try {
            await chatService.deleteChat(selectedChat.id);
            if (!active) return;
            websocketService.disconnect();
            chatModel.clearChat(selectedChat.id);
            selectedChat = null;
            chatModel.deselectChat();
            if (conversation) conversation.hidden = true;
            await loadChats();
            await showSuccessPopup('Chat deleted.');
        } catch (error) {
            await showErrorPopup(`Could not delete chat: ${getErrorMessage(error)}`);
        }
    });

    logoutButton?.addEventListener('click', async () => {
        const button = logoutButton;
        const originalText = button?.textContent || '';
        
        try {
            if (button) setButtonLoading(button, true);
            await authService.logout();
            if (!active) return;
            websocketService.disconnect();
            chatModel.clear();
            navigate('/');
        } catch (error) {
            if (button) {
                setButtonLoading(button, false);
                button.textContent = originalText;
            }
            await showErrorPopup(`Logout failed: ${getErrorMessage(error)}`);
        }
    });

    void loadChats();

    return () => {
        active = false;
        websocketService.disconnect();
        chatCards.forEach((card) => card.destroy());
        destroyPage();
    };
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
}

