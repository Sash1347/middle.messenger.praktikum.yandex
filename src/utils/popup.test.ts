import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  showSuccessPopup,
  showErrorPopup,
  showPromptPopup,
  showConfirmPopup,
} from './popup';

describe('Popup утилиты', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
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
