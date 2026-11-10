import type { FormValues } from '../../components/form/helper';
import { httpClient } from '../../utils/http';
import { navigate } from '../../router/router';
import { showSuccessPopup, showErrorPopup } from '../../utils/popup';
import { setButtonLoading } from '../../utils/buttonLoader';

export const changePasswordFormSubmit = async (data: FormValues): Promise<void> => {
  const button = document.querySelector<HTMLButtonElement>('button[type="submit"]');
  const originalText = button?.textContent || '';
  
  try {
    if (data.new_password !== data.confirm_password) {
      await showErrorPopup('Passwords do not match!');
      return;
    }

    if (button) setButtonLoading(button, true);

    await httpClient.put('/user/password', {
      oldPassword: data.old_password,
      newPassword: data.new_password,
    });

    await showSuccessPopup('Password changed successfully!');
    navigate('/messenger');
  } catch (error) {
    if (button) {
      setButtonLoading(button, false);
      button.textContent = originalText;
    }
    await showErrorPopup(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
