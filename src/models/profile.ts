export interface UserProfile {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  display_name: string;
  phone: string;
}

class ProfileModel {
  private profile: UserProfile = {
    first_name: 'Name',
    second_name: 'Surname',
    login: 'login',
    email: 'email@example.com',
    display_name: 'username',
    phone: '+1234567890',
  };

  getProfile(): UserProfile {
    return { ...this.profile };
  }

  update(profile: UserProfile): void {
    this.profile = { ...profile };
  }
}

export const profileModel = new ProfileModel();
