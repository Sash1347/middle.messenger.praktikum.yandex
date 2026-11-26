export interface UserProfile {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  display_name: string;
  phone: string;
  avatar: string | null;
}

class ProfileModel {
  private profile: UserProfile = {
    first_name: '',
    second_name: '',
    login: '',
    email: '',
    display_name: '',
    phone: '',
    avatar: null,
  };

  getProfile(): UserProfile {
    return { ...this.profile };
  }

  update(profile: UserProfile): void {
    this.profile = { ...profile };
  }
}

export const profileModel = new ProfileModel();
