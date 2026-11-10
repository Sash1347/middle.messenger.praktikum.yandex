import { httpClient, UnauthorizedError } from './http';

export interface UserData {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string | null;
}

class AuthService {
  private readonly STORAGE_KEY = 'auth_user';

  async login(login: string, password: string): Promise<UserData> {
    await httpClient.post('/auth/signin', {
      login,
      password,
    });

    const user = await this.getUser();
    this.saveUser(user);
    return user;
  }

  async signup(
    email: string,
    login: string,
    first_name: string,
    second_name: string,
    phone: string,
    password: string,
  ): Promise<UserData> {
    await httpClient.post('/auth/signup', {
      first_name,
      second_name,
      login,
      email,
      phone,
      password,
    });

    const user = await this.getUser();
    this.saveUser(user);
    return user;
  }

  async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout');
    } finally {
      this.clearUser();
    }
  }

  async getUser(): Promise<UserData> {
    return httpClient.get<UserData>('/auth/user');
  }

  async checkSession(): Promise<boolean> {
    try {
      const user = await this.getUser();
      this.saveUser(user);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        this.clearUser();
        return false;
      }
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.getAuthUser() !== null;
  }

  getAuthUser(): UserData | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;

    try {
      const user: unknown = JSON.parse(stored);
      if (user && typeof user === 'object' && 'id' in user && 'login' in user
        && typeof user.id === 'number' && typeof user.login === 'string') {
        return user as UserData;
      }
      this.clearUser();
      return null;
    } catch {
      this.clearUser();
      return null;
    }
  }

  private saveUser(user: UserData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  private clearUser(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const authService = new AuthService();
