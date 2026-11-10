import type { FormValues } from '../../components/form/helper';
import { authService } from '../../utils/auth';
import { navigate } from '../../router/router';
import { setButtonLoading } from '../../utils/buttonLoader';
import { showErrorPopup } from '../../utils/popup';

export const registrationFormSubmit = async (data: FormValues): Promise<void> => {
  const button = document.querySelector<HTMLButtonElement>('button[type="submit"]');
  const originalText = button?.textContent || '';
  
  try {
    if (button) setButtonLoading(button, true);
    
    await authService.signup(
      String(data.email),
      String(data.login),
      String(data.first_name),
      String(data.second_name),
      String(data.phone),
      String(data.password)
    );
    navigate('/messenger');
  } catch (error) {
    if (button) {
      setButtonLoading(button, false);
      button.textContent = originalText;
    }
    await showErrorPopup(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

