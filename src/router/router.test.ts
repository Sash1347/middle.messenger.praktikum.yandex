import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { navigate } from './router';

vi.mock('../utils/auth', () => ({
  authService: {
    isAuthenticated: vi.fn(() => false),
    checkSession: vi.fn().mockResolvedValue(false),
  },
}));

vi.mock('../pages/login', () => ({
  default: vi.fn(),
}));

vi.mock('../pages/registration', () => ({
  default: vi.fn(),
}));

vi.mock('../pages/main', () => ({
  default: vi.fn(),
}));

vi.mock('../pages/error', () => ({
  default: vi.fn(),
}));

vi.mock('../pages/profile', () => ({
  default: vi.fn(),
}));

vi.mock('../pages/editProfile', () => ({
  default: vi.fn(),
}));

vi.mock('../pages/changePassword', () => ({
  default: vi.fn(),
}));

describe('Router', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    history.pushState({}, '', '/');
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('navigate функция', () => {
    it('изменяет URL при навигации', () => {
      const pushStateSpy = vi.spyOn(history, 'pushState');

      navigate('/messenger');

      expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/messenger');
      pushStateSpy.mockRestore();
    });

    it('добавляет query параметры к URL', () => {
      const pushStateSpy = vi.spyOn(history, 'pushState');

      navigate('/404', { code: '404' });

      expect(pushStateSpy).toHaveBeenCalledWith({}, '', expect.stringContaining('?'));
      expect(pushStateSpy).toHaveBeenCalledWith({}, '', expect.stringContaining('code=404'));
      pushStateSpy.mockRestore();
    });

    it('навигирует без query параметров', () => {
      const pushStateSpy = vi.spyOn(history, 'pushState');

      navigate('/sign-up');

      expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/sign-up');
      pushStateSpy.mockRestore();
    });
  });

  describe('Навигация по клику на ссылку', () => {
    it('не перехватывает клик на ссылку с download атрибутом', () => {
      const appElement = document.getElementById('app') as HTMLElement;
      const link = document.createElement('a');
      link.href = 'http://localhost/file.pdf';
      link.download = 'file.pdf';

      appElement.appendChild(link);

      const pushStateSpy = vi.spyOn(history, 'pushState');

      link.click();

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it('не перехватывает клик с ctrl/meta/shift/alt', () => {
      const appElement = document.getElementById('app') as HTMLElement;
      const link = document.createElement('a');
      link.href = 'http://localhost/messenger';

      appElement.appendChild(link);

      const pushStateSpy = vi.spyOn(history, 'pushState');

      const event = new MouseEvent('click', {
        ctrlKey: true,
      });
      link.dispatchEvent(event);

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it('не перехватывает клик на ссылку с target="_blank"', () => {
      const appElement = document.getElementById('app') as HTMLElement;
      const link = document.createElement('a');
      link.href = 'http://localhost/messenger';
      link.target = '_blank';

      appElement.appendChild(link);

      const pushStateSpy = vi.spyOn(history, 'pushState');

      link.click();

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it('не перехватывает клик на внешнюю ссылку', () => {
      const appElement = document.getElementById('app') as HTMLElement;
      const link = document.createElement('a');
      link.href = 'https://google.com/page';

      appElement.appendChild(link);

      const pushStateSpy = vi.spyOn(history, 'pushState');

      link.click();

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it('не перехватывает клик на ссылку с hash', () => {
      const appElement = document.getElementById('app') as HTMLElement;
      const link = document.createElement('a');
      link.href = 'http://localhost/page#section';

      appElement.appendChild(link);

      const pushStateSpy = vi.spyOn(history, 'pushState');

      link.click();

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it('не перехватывает клик если preventDefault вызван', () => {
      const appElement = document.getElementById('app') as HTMLElement;
      const link = document.createElement('a');
      link.href = 'http://localhost/messenger';

      appElement.appendChild(link);

      const pushStateSpy = vi.spyOn(history, 'pushState');

      const event = new MouseEvent('click', { bubbles: true });
      event.preventDefault();
      link.dispatchEvent(event);

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });

    it('не перехватывает правый клик', () => {
      const appElement = document.getElementById('app') as HTMLElement;
      const link = document.createElement('a');
      link.href = 'http://localhost/messenger';

      appElement.appendChild(link);

      const pushStateSpy = vi.spyOn(history, 'pushState');

      const event = new MouseEvent('click', { button: 2 });
      link.dispatchEvent(event);

      expect(pushStateSpy).not.toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });
  });

  describe('Обработка popstate события', () => {
    it('вызывает renderRoute при popstate', () => {
      const pushStateSpy = vi.spyOn(history, 'pushState');

      navigate('/sign-up');

      expect(pushStateSpy).toHaveBeenCalled();
      pushStateSpy.mockRestore();
    });
  });
});

