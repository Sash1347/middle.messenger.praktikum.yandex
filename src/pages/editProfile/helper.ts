import type { FormValues } from '../../components/form/helper';
import { profileModel, type UserProfile } from '../../models/profile';

export const editProfileFormSubmit = (data: FormValues): void => {
  const profile = profileModel.getProfile();
  for (const key of Object.keys(profile) as Array<keyof UserProfile>) {
    const value = data[key];
    if (key === 'display_name' && value === undefined) {
      profile[key] = '';
    } else if (typeof value === 'string') {
      profile[key] = value;
    } else {
      throw new Error(`Profile field must be text: ${key}`);
    }
  }
  profileModel.update(profile);
  console.log(data);
};
