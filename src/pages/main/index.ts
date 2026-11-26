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
import {
    isSupportedChatImage,
    showConfirmPopup,
    showCreateChatPopup,
    showErrorPopup,
    showMembersPopup,
    showPromptPopup,
    showSuccessPopup,
} from '../../utils/popup.ts';

import './index.scss';

export default function RenderMainContent(renderToHtml: RenderContent) {
    chatModel.deselectChat();
    const destroyPage = renderPage(template, {}, renderToHtml);

    const chatList = document.querySelector<HTMLElement>('.chat-layout__chats-list');
    const layout = document.querySelector<HTMLElement>('.chat-layout');
    const conversation = document.querySelector<HTMLElement>('.chat-layout__conversation');
    const connectionStatus = document.querySelector<HTMLElement>('.chat-layout__connection');
    const newChatButton = document.querySelector<HTMLButtonElement>('.chat-layout__new-chat');
    const addUserButton = document.querySelector<HTMLButtonElement>('.dialog-header__add-user');
    const deleteChatButton = document.querySelector<HTMLButtonElement>('.dialog-header__delete');
    const chatTitle = document.querySelector<HTMLElement>('.dialog-header__name');
    const chatUsers = document.querySelector<HTMLButtonElement>('.dialog-header__users');
    const avatarButton = document.querySelector<HTMLButtonElement>('.dialog-header__avatar');
    const avatarImage = document.querySelector<HTMLImageElement>('.dialog-header__avatar-image');
    const avatarInput = document.querySelector<HTMLInputElement>('.dialog-header__avatar-input');
    const logoutButton = document.querySelector<HTMLButtonElement>('.btn-logout');

    let chats: ChatData[] = [];
    let selectedChat: ChatData | null = null;
    let chatCards: ChatCard[] = [];
    let active = true;
    let selectionVersion = 0;
    let avatarTargetId: number | null = null;
    let avatarUploadInProgress = false;

    const avatarUrl = (chat: ChatData) => chat.avatar
        ? `https://ya-praktikum.tech/api/v2/resources${chat.avatar}`
        : null;

    const showChatAvatar = (chat: ChatData) => {
        if (!avatarImage) return;
        const url = avatarUrl(chat);
        avatarImage.hidden = !url;
        if (url) avatarImage.src = url;
        else avatarImage.removeAttribute('src');
    };

    const handleAvatarError = (event: Event) => {
        const target = event.target;
        if (target instanceof HTMLImageElement
            && target.matches('.chat-card__avatar-image, .dialog-header__avatar-image')) {
            target.hidden = true;
        }
    };
    layout?.addEventListener('error', handleAvatarError, true);

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
                avatar: avatarUrl(chat),
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
        if (deleteChatButton) deleteChatButton.disabled = !enabled;
        if (chatUsers) chatUsers.disabled = !enabled;
        if (avatarButton) avatarButton.disabled = !enabled || avatarUploadInProgress;
    };

    const refreshChatUsers = async (chat: ChatData) => {
        const version = selectionVersion;
        try {
            const users = await chatService.getChatUsers(chat.id);
            if (active && selectionVersion === version && selectedChat?.id === chat.id && chatUsers) {
                chatUsers.textContent = `${users.length} ${users.length === 1 ? 'member' : 'members'}`;
            }
        } catch (error) {
            if (active && selectionVersion === version && selectedChat?.id === chat.id) {
                if (chatUsers) chatUsers.textContent = 'Members unavailable';
                await showErrorPopup(`Could not load chat members: ${getErrorMessage(error)}`);
            }
        }
    };

    async function selectChat(chat: ChatData): Promise<void> {
        selectionVersion += 1;
        selectedChat = chat;
        chatModel.selectChat(chat.id);
        if (conversation) conversation.hidden = false;
        if (chatTitle) chatTitle.textContent = chat.title;
        showChatAvatar(chat);
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
            if (!active) return false;
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
            return true;
        } catch (error) {
            if (!active) return false;
            if (chatList) chatList.textContent = 'Could not load chats.';
            await showErrorPopup(`Could not load chats: ${getErrorMessage(error)}`);
            return false;
        }
    };

    newChatButton?.addEventListener('click', async () => {
        if (newChatButton.disabled) return;
        newChatButton.disabled = true;
        try {
            const result = await showCreateChatPopup();
            if (!result || !active) return;
            const createdChat = await chatService.createChat(result.title);
            if (!active) return;
            let uploadError: unknown = null;
            let uploadFailed = false;
            if (result.avatar) {
                try {
                    await chatService.updateAvatar(createdChat.id, result.avatar);
                } catch (error) {
                    uploadFailed = true;
                    uploadError = error;
                }
            }
            if (!active) return;
            const loaded = await loadChats(createdChat.id);
            if (!active) return;
            if (uploadFailed) {
                void showErrorPopup(`Chat created, but the image could not be uploaded: ${getErrorMessage(uploadError)}`);
            } else if (loaded) {
                void showSuccessPopup('Chat created.');
            }
        } catch (error) {
            if (active) void showErrorPopup(`Could not create chat: ${getErrorMessage(error)}`);
        } finally {
            if (active) newChatButton.disabled = false;
        }
    });

    avatarButton?.addEventListener('click', () => {
        if (!selectedChat || avatarUploadInProgress) return;
        avatarTargetId = selectedChat.id;
        avatarInput?.click();
    });

    avatarInput?.addEventListener('change', async () => {
        const chatId = avatarTargetId;
        const file = avatarInput.files?.[0];
        avatarTargetId = null;
        avatarInput.value = '';
        if (!file || chatId === null) return;
        if (selectedChat?.id !== chatId) {
            void showErrorPopup('The selected chat changed. Choose the image again.');
            return;
        }
        if (!isSupportedChatImage(file)) {
            void showErrorPopup('Choose a JPEG, PNG, GIF or WebP image.');
            return;
        }
        avatarUploadInProgress = true;
        if (avatarButton) avatarButton.disabled = true;
        try {
            const updated = await chatService.updateAvatar(chatId, file);
            if (!active) return;
            chats = chats.map((chat) => chat.id === chatId ? { ...chat, avatar: updated.avatar } : chat);
            if (selectedChat?.id === chatId) {
                selectedChat = chats.find((chat) => chat.id === chatId) ?? null;
                if (selectedChat) showChatAvatar(selectedChat);
            }
            renderChatCards();
            void showSuccessPopup('Chat image updated.');
        } catch (error) {
            if (active) void showErrorPopup(`Could not update chat image: ${getErrorMessage(error)}`);
        } finally {
            avatarUploadInProgress = false;
            if (active && avatarButton) avatarButton.disabled = !selectedChat;
        }
    });

    const addChatUsers = async () => {
        const chat = selectedChat;
        if (!chat) return;
        const enteredIds = await showPromptPopup(
            'Add members',
            'Enter numeric user IDs separated by commas.',
        );
        if (enteredIds === null || !active || selectedChat?.id !== chat.id) return;

        const userIds = enteredIds.split(',').map((value: string) => Number(value.trim()));
        if (userIds.length === 0 || userIds.some((id: number) => !Number.isInteger(id) || id <= 0)) {
            await showErrorPopup('Enter one or more positive numeric user IDs.');
            return;
        }

        try {
            await chatService.addUsers(chat.id, userIds);
            if (!active) return;
            if (selectedChat?.id === chat.id) await refreshChatUsers(chat);
            await showSuccessPopup('User(s) added.');
        } catch (error) {
            if (active) await showErrorPopup(`Could not add user(s): ${getErrorMessage(error)}`);
        }
    };

    const openMembers = async () => {
        const chat = selectedChat;
        const button = chatUsers;
        if (!chat || !button || button.disabled) return;
        const version = selectionVersion;
        button.disabled = true;
        try {
            const storedUser = authService.getAuthUser();
            if (!storedUser) throw new Error('Could not identify the current user. Sign in again.');
            const [users, currentUser] = await Promise.all([
                chatService.getChatUsers(chat.id),
                authService.getUser(),
            ]);
            if (!active || selectionVersion !== version || selectedChat?.id !== chat.id) return;
            if (currentUser.id !== storedUser.id || authService.getAuthUser()?.id !== currentUser.id) {
                throw new Error('Current user changed. Sign in again.');
            }
            const members = users.map((user) => {
                const avatar = user.id === currentUser.id ? currentUser.avatar || user.avatar : user.avatar;
                return {
                    id: user.id,
                    name: user.display_name || `${user.first_name} ${user.second_name}`.trim() || user.login,
                    login: user.login,
                    avatar: avatar ? `https://ya-praktikum.tech/api/v2/resources${avatar}` : null,
                };
            });
            const selectedId = await showMembersPopup(members, currentUser.id);
            if (selectedId === null || !active || selectionVersion !== version || selectedChat?.id !== chat.id) return;
            const member = members.find((item) => item.id === selectedId);
            if (!member) throw new Error('Selected member not found');
            if (selectedId === currentUser.id) throw new Error('You cannot remove yourself from the chat.');
            const confirmed = await showConfirmPopup(
                'Remove member',
                `Remove ${member.name} (@${member.login}) from "${chat.title}"?`,
            );
            if (!confirmed || !active || selectionVersion !== version || selectedChat?.id !== chat.id) return;
            if (authService.getAuthUser()?.id !== currentUser.id) {
                throw new Error('Current user changed. Sign in again.');
            }
            await chatService.removeUsers(chat.id, [selectedId]);
            if (!active) return;
            if (selectedChat?.id === chat.id) {
                await refreshChatUsers(chat);
            }
            void showSuccessPopup('User removed.');
        } catch (error) {
            if (active) void showErrorPopup(`Could not load members or remove user: ${getErrorMessage(error)}`);
        } finally {
            if (active && selectionVersion === version && selectedChat?.id === chat.id) button.disabled = false;
        }
    };

    addUserButton?.addEventListener('click', () => void addChatUsers());
    chatUsers?.addEventListener('click', () => void openMembers());

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
        layout?.removeEventListener('error', handleAvatarError, true);
        chatCards.forEach((card) => card.destroy());
        destroyPage();
    };
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
}

