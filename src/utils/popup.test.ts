import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import {
  showSuccessPopup,
  showErrorPopup,
  showPromptPopup,
  showConfirmPopup,
  showMembersPopup,
  showCreateChatPopup,
} from './popup';

describe('Popup утилиты', () => {
  const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
  const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');

  beforeAll(() => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value(this: HTMLDialogElement) { this.open = true; },
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value(this: HTMLDialogElement) { this.open = false; },
    });
  });

  afterAll(() => {
    if (originalShowModal) {
      Object.defineProperty(HTMLDialogElement.prototype, 'showModal', originalShowModal);
    } else {
      Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
    }
    if (originalClose) {
      Object.defineProperty(HTMLDialogElement.prototype, 'close', originalClose);
    } else {
      Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
    }
  });

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.querySelectorAll<HTMLButtonElement>('.popup-dialog__button--secondary')
      .forEach((button) => button.click());
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  describe('showSuccessPopup', () => {
    it('создаёт успешное уведомление с сообщением', async () => {
      const promise = showSuccessPopup('Operation successful');

      expect(document.querySelector('.popup--success')).toBeTruthy();
      expect(document.querySelector('.popup__message')?.textContent).toBe('Operation successful');

      vi.runAllTimers();
      await promise;
    });

    it('использует стандартное сообщение если не передано', async () => {
      const promise = showSuccessPopup();

      expect(document.querySelector('.popup__message')?.textContent).toBe('Success!');

      vi.runAllTimers();
      await promise;
    });

    it('добавляет иконку "+" для успеха', async () => {
      const promise = showSuccessPopup('Test');

      expect(document.querySelector('.popup__icon')?.textContent).toBe('+');

      vi.runAllTimers();
      await promise;
    });

    it('удаляет popup после истечения времени', async () => {
      const promise = showSuccessPopup('Test');

      expect(document.querySelector('.popup--success')).toBeTruthy();

      vi.runAllTimers();
      await promise;

      expect(document.querySelector('.popup--success')).toBeNull();
    });
  });

  describe('showErrorPopup', () => {
    it('создаёт ошибочное уведомление с сообщением', async () => {
      const promise = showErrorPopup('Error occurred');

      expect(document.querySelector('.popup--error')).toBeTruthy();
      expect(document.querySelector('.popup__message')?.textContent).toBe('Error occurred');

      vi.runAllTimers();
      await promise;
    });

    it('добавляет иконку "!" для ошибки', async () => {
      const promise = showErrorPopup('Test');

      expect(document.querySelector('.popup__icon')?.textContent).toBe('!');

      vi.runAllTimers();
      await promise;
    });
  });

  describe('showPromptPopup', () => {
    it('показывает диалог с заголовком и сообщением', () => {
      showPromptPopup('Enter name', 'Please enter your name');

      expect(document.querySelector('.popup-dialog__title')?.textContent).toBe('Enter name');
      expect(document.querySelector('.popup-dialog__message')?.textContent).toBe('Please enter your name');
    });

    describe('showCreateChatPopup', () => {
      it('requires a title and allows creating without an image', async () => {
        const result = showCreateChatPopup();
        const form = document.querySelector<HTMLFormElement>('.popup-dialog form');
        form?.requestSubmit();
        expect(document.querySelector('.popup-dialog__validation')?.textContent).toBe('Enter a chat name.');
        const name = document.querySelector<HTMLInputElement>('.popup-dialog input[type="text"]');
        if (!name) throw new Error('Name input missing');
        name.value = ' New chat ';
        form?.requestSubmit();
        expect(await result).toEqual({ title: 'New chat', avatar: null });
      });

      it('accepts an image and rejects unsupported files', async () => {
        const result = showCreateChatPopup();
        const name = document.querySelector<HTMLInputElement>('.popup-dialog input[type="text"]');
        const fileInput = document.querySelector<HTMLInputElement>('.popup-dialog input[type="file"]');
        const form = document.querySelector<HTMLFormElement>('.popup-dialog form');
        if (!name || !fileInput || !form) throw new Error('Create form missing');
        name.value = 'Test';
        Object.defineProperty(fileInput, 'files', { configurable: true, value: [new File(['x'], 'bad.txt', { type: 'text/plain' })] });
        form.requestSubmit();
        expect(document.querySelector('.popup-dialog__validation')?.textContent).toContain('JPEG');
        const file = new File(['x'], 'avatar.png', { type: 'image/png' });
        Object.defineProperty(fileInput, 'files', { configurable: true, value: [file] });
        form.requestSubmit();
        expect(await result).toEqual({ title: 'Test', avatar: file });
      });
    });

    it('создаёт input поле', () => {
      showPromptPopup('Enter value', 'Test message');

      const input = document.querySelector('.popup-dialog__input') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.type).toBe('text');
    });

    it('создаёт кнопки Cancel и Continue', () => {
      showPromptPopup('Enter value', 'Test');

      const buttons = document.querySelectorAll('.popup-dialog__button');
      expect(buttons.length).toBe(2);
    });

    it('не отправляет форму с пустым значением', () => {
      showPromptPopup('Enter value', 'Test');

      const input = document.querySelector('.popup-dialog__input') as HTMLInputElement;
      const form = document.querySelector('form') as HTMLFormElement;

      input.value = '';
      form.dispatchEvent(new Event('submit'));

      const validation = document.querySelector('.popup-dialog__validation');
      expect(validation?.textContent).toBe('This field is required.');
    });

    it('очищает сообщение валидации при вводе', () => {
      showPromptPopup('Enter value', 'Test');

      const input = document.querySelector('.popup-dialog__input') as HTMLInputElement;
      const form = document.querySelector('form') as HTMLFormElement;
      const validation = document.querySelector('.popup-dialog__validation') as HTMLElement;

      form.dispatchEvent(new Event('submit'));
      expect(validation.textContent).toBe('This field is required.');

      input.value = 'a';
      input.dispatchEvent(new Event('input'));

      expect(validation.textContent).toBe('');
    });
  });

  describe('showConfirmPopup', () => {
    it('показывает диалог с заголовком и сообщением', () => {
      showConfirmPopup('Delete item?', 'This action cannot be undone');

      expect(document.querySelector('.popup-dialog__title')?.textContent).toBe('Delete item?');
      expect(document.querySelector('.popup-dialog__message')?.textContent).toBe('This action cannot be undone');
    });

    describe('showMembersPopup', () => {
      const members = [
        { id: 4, name: '<Alice>', login: 'alice', avatar: '/alice.png' },
        { id: 8, name: 'Bob', login: 'bob', avatar: '/bob.png' },
      ];

      it('shows names and avatars and removes a member from the list', async () => {
        const result = showMembersPopup(members, 4);
        expect(document.querySelectorAll('.popup-dialog__member')).toHaveLength(2);
        expect(document.querySelector('.popup-dialog__member-details')?.textContent).toBe('<Alice>@alice');
        expect(document.querySelector('.popup-dialog__member-details img')).toBeNull();
        const avatar = document.querySelector<HTMLImageElement>('.popup-dialog__member-avatar');
        expect(avatar?.getAttribute('src')).toBe('/alice.png');
        expect(avatar?.crossOrigin).toBe('use-credentials');
        expect(document.querySelectorAll<HTMLImageElement>('.popup-dialog__member-avatar')[1].getAttribute('src')).toBe('/bob.png');
        avatar?.dispatchEvent(new Event('error'));
        expect(document.querySelector('.popup-dialog__member-avatar')?.tagName).toBe('SPAN');
        const buttons = document.querySelectorAll<HTMLButtonElement>('.popup-dialog__member-remove');
        expect(document.querySelectorAll('.popup-dialog__member')[0].querySelector('.popup-dialog__member-remove')).toBeNull();
        expect(buttons).toHaveLength(1);
        expect(buttons[0].getAttribute('aria-label')).toBe('Remove Bob (@bob)');
        buttons[0].click();
        expect(await result).toBe(8);
      });

      it('closes the member list without selecting anyone', async () => {
        const result = showMembersPopup(members, 4);
        expect(document.querySelector('input[name="member"]')).toBeNull();
        document.querySelector<HTMLButtonElement>('.popup-dialog__button--secondary')?.click();
        expect(await result).toBeNull();
      });

      it('shows an empty circle when a member has no avatar', async () => {
        const result = showMembersPopup([{ ...members[0], avatar: null }], 4);
        expect(document.querySelector('.popup-dialog__member-avatar')?.tagName).toBe('SPAN');
        document.querySelector<HTMLButtonElement>('.popup-dialog__button--secondary')?.click();
        await result;
      });
    });

    it('создаёт кнопки Cancel и Delete', () => {
      showConfirmPopup('Delete?', 'Confirm');

      const buttons = document.querySelectorAll('.popup-dialog__button');
      expect(buttons.length).toBe(2);
      
      const deleteBtn = document.querySelector('.popup-dialog__button--danger');
      expect(deleteBtn?.textContent).toBe('Delete');
    });
  });

  describe('Контейнер popup', () => {
    it('создаёт контейнер при первом popup', async () => {
      const promise = showSuccessPopup('Test');

      expect(document.querySelector('.popup-stack')).toBeTruthy();

      vi.runAllTimers();
      await promise;
    });

    it('переиспользует контейнер для нескольких popups', async () => {
      const promise1 = showSuccessPopup('Test 1');
      const promise2 = showSuccessPopup('Test 2');

      const containers = document.querySelectorAll('.popup-stack');
      expect(containers.length).toBe(1);

      vi.runAllTimers();
      await promise1;
      await promise2;
    });

    it('удаляет контейнер когда он пуст', async () => {
      const promise = showSuccessPopup('Test');

      expect(document.querySelector('.popup-stack')).toBeTruthy();

      vi.runAllTimers();
      await promise;

      expect(document.querySelector('.popup-stack')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('добавляет aria-live="polite" для success', async () => {
      const promise = showSuccessPopup('Test');

      const popup = document.querySelector('.popup--success');
      expect(popup?.getAttribute('aria-live')).toBe('polite');

      vi.runAllTimers();
      await promise;
    });

    it('добавляет aria-live="assertive" для error', async () => {
      const promise = showErrorPopup('Test');

      const popup = document.querySelector('.popup--error');
      expect(popup?.getAttribute('aria-live')).toBe('assertive');

      vi.runAllTimers();
      await promise;
    });

    it('добавляет aria-label на кнопку закрытия', async () => {
      const promise = showSuccessPopup('Test');

      const closeButton = document.querySelector('.popup__close');
      expect(closeButton?.getAttribute('aria-label')).toBe('Dismiss notification');

      vi.runAllTimers();
      await promise;
    });

    it('скрывает иконку от скрин-ридеров', async () => {
      const promise = showSuccessPopup('Test');

      const icon = document.querySelector('.popup__icon');
      expect(icon?.getAttribute('aria-hidden')).toBe('true');

      vi.runAllTimers();
      await promise;
    });
  });
});
