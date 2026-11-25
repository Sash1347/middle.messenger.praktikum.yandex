import { beforeEach, describe, expect, it, vi } from 'vitest';
import { navigate } from './router';
import MessengerPage from '../pages/main';

vi.mock('../utils/auth', () => ({
  authService: {
    isAuthenticated: vi.fn(() => true),
    checkSession: vi.fn().mockResolvedValue(true),
  },
}));
vi.mock('../pages/main', () => ({ default: vi.fn() }));
vi.mock('../pages/login', () => ({ default: vi.fn() }));
vi.mock('../pages/registration', () => ({ default: vi.fn() }));
vi.mock('../pages/error', () => ({ default: vi.fn() }));
vi.mock('../pages/profile', () => ({ default: vi.fn() }));
vi.mock('../pages/editProfile', () => ({ default: vi.fn() }));
vi.mock('../pages/changePassword', () => ({ default: vi.fn() }));

describe('route lifecycle', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.clearAllMocks();
  });

  it('cleans up the previous page when navigating away', async () => {
    const cleanup = vi.fn();
    vi.mocked(MessengerPage).mockReturnValueOnce(cleanup);
    navigate('/messenger');
    await vi.waitFor(() => expect(MessengerPage).toHaveBeenCalledOnce());

    navigate('/settings');
    await vi.waitFor(() => expect(cleanup).toHaveBeenCalledOnce());
  });
});
