import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setButtonLoading, createLoadingSpinner } from './buttonLoader';

describe('Button Loader утилиты', () => {
  let button: HTMLButtonElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    button = document.createElement('button');
    button.textContent = 'Submit';
    document.body.appendChild(button);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('setButtonLoading', () => {
    it('отключает кнопку при загрузке', () => {
      expect(button.disabled).toBe(false);

      setButtonLoading(button, true);

      expect(button.disabled).toBe(true);
    });

    it('включает кнопку после загрузки', () => {
      setButtonLoading(button, true);
      expect(button.disabled).toBe(true);

      setButtonLoading(button, false);

      expect(button.disabled).toBe(false);
    });

    it('добавляет спиннер при загрузке', () => {
      setButtonLoading(button, true);

      expect(button.innerHTML).toContain('div');
    });

    it('устанавливает position relative на кнопку', () => {
      setButtonLoading(button, true);

      expect(button.style.position).toBe('relative');
    });

    it('добавляет стили анимации в head', () => {
      setButtonLoading(button, true);

      const style = document.querySelector('style[data-loader]');
      expect(style).toBeTruthy();
      expect(style?.textContent).toContain('@keyframes spin');
    });

    it('не добавляет дубликаты стилей', () => {
      setButtonLoading(button, true);
      setButtonLoading(button, false);
      setButtonLoading(button, true);

      const styles = document.querySelectorAll('style[data-loader]');
      expect(styles.length).toBe(1);
    });

    it('не запускается при false на кнопке без загрузки', () => {
      const originalHTML = button.innerHTML;

      setButtonLoading(button, false);

      expect(button.innerHTML).toBe(originalHTML);
    });

    it('можно многократно включать/отключать', () => {
      for (let i = 0; i < 5; i++) {
        setButtonLoading(button, true);
        expect(button.disabled).toBe(true);

        setButtonLoading(button, false);
        expect(button.disabled).toBe(false);
      }
    });

    it('работает с несколькими кнопками независимо', () => {
      const button2 = document.createElement('button');
      document.body.appendChild(button2);

      setButtonLoading(button, true);
      setButtonLoading(button2, false);

      expect(button.disabled).toBe(true);
      expect(button2.disabled).toBe(false);
    });
  });

  describe('createLoadingSpinner', () => {
    it('создаёт div элемент', () => {
      const spinner = createLoadingSpinner();

      expect(spinner.tagName).toBe('DIV');
    });

    it('добавляет стили для спиннера', () => {
      const spinner = createLoadingSpinner();

      expect(spinner.style.display).toBe('inline-block');
      expect(spinner.style.width).toBe('16px');
      expect(spinner.style.height).toBe('16px');
    });

    it('добавляет border-radius стиль', () => {
      const spinner = createLoadingSpinner();

      expect(spinner.style.borderRadius).toBe('50%');
    });

    it('добавляет анимацию', () => {
      const spinner = createLoadingSpinner();

      expect(spinner.style.animation).toContain('spin');
      expect(spinner.style.animation).toContain('0.8s');
    });

    it('добавляет спиннер в DOM без ошибок', () => {
      const spinner = createLoadingSpinner();

      expect(() => {
        document.body.appendChild(spinner);
      }).not.toThrow();

      expect(document.body.contains(spinner)).toBe(true);
    });

    it('каждый вызов возвращает новый элемент', () => {
      const spinner1 = createLoadingSpinner();
      const spinner2 = createLoadingSpinner();

      expect(spinner1).not.toBe(spinner2);
    });

    it('можно добавлять несколько спиннеров', () => {
      const spinner1 = createLoadingSpinner();
      const spinner2 = createLoadingSpinner();

      document.body.appendChild(spinner1);
      document.body.appendChild(spinner2);

      expect(document.body.contains(spinner1)).toBe(true);
      expect(document.body.contains(spinner2)).toBe(true);
    });
  });

  describe('Интеграция', () => {
    it('может использовать createLoadingSpinner с setButtonLoading', () => {
      const spinner = createLoadingSpinner();
      setButtonLoading(button, true);

      expect(() => {
        button.innerHTML = spinner.outerHTML;
      }).not.toThrow();
    });

    it('кнопка остаётся отключённой после замены содержимого', () => {
      setButtonLoading(button, true);
      expect(button.disabled).toBe(true);

      button.innerHTML += '<span>Extra</span>';
      expect(button.disabled).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('работает с пустой кнопкой', () => {
      button.textContent = '';

      expect(() => {
        setButtonLoading(button, true);
      }).not.toThrow();

      expect(button.disabled).toBe(true);
    });

    it('работает с кнопкой с дочерними элементами', () => {
      button.innerHTML = '<span>Submit</span><span>Now</span>';

      expect(() => {
        setButtonLoading(button, true);
      }).not.toThrow();

      expect(button.disabled).toBe(true);
    });
  });
});
