import type { FormValues } from '../../components/form/helper';
import { profileModel } from '../../models/profile';
import { httpClient } from '../../utils/http';
import { authService } from '../../utils/auth';
import { navigate } from '../../router/router';
import { showSuccessPopup, showErrorPopup } from '../../utils/popup';
import { setButtonLoading } from '../../utils/buttonLoader';

export const editProfileFormSubmit = async (data: FormValues): Promise<void> => {
  const button = document.querySelector<HTMLButtonElement>('button[type="submit"]');
  const originalText = button?.textContent || '';
  
  try {
    const updateData: Record<string, string> = {};
    const allowedFields = ['login', 'email', 'first_name', 'second_name', 'display_name', 'phone'];

    for (const key of allowedFields) {
      const value = data[key];
      if (key === 'display_name' && value === undefined) {
        updateData[key] = '';
      } else if (typeof value === 'string') {
        updateData[key] = value;
      }
    }

    if (button) setButtonLoading(button, true);

    await httpClient.put('/user/profile', updateData);

    if (data.avatar instanceof File) {
      const formData = new FormData();
      formData.append('avatar', data.avatar);
      await httpClient.put('/user/profile/avatar', formData);
    }

    const updatedUser = await authService.getUser();
    profileModel.update(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));

    await showSuccessPopup('Profile updated successfully!');
    setTimeout(() => {
      navigate('/messenger');
    }, 2000);
  } catch (error) {
    if (button) {
      setButtonLoading(button, false);
      button.textContent = originalText;
    }
    await showErrorPopup(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
