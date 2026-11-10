import type { FormValues } from '../../components/form/helper';
import { authService } from '../../utils/auth';
import { navigate } from '../../router/router';
import { setButtonLoading } from '../../utils/buttonLoader';
import { showErrorPopup } from '../../utils/popup';

export const loginFormSubmit = async (data: FormValues): Promise<void> => {
  const button = document.querySelector<HTMLButtonElement>('button[type="submit"]');
  const originalText = button?.textContent || '';
  
  try {
    if (button) setButtonLoading(button, true);
    await authService.login(String(data.login), String(data.password));
    navigate('/messenger');
  } catch (error) {
    if (button) {
      setButtonLoading(button, false);
      button.textContent = originalText;
    }
    await showErrorPopup(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

