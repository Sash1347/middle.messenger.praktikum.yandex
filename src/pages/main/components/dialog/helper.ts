import type { FormValues } from '../../../../components/form/helper';
import { websocketService } from '../../../../services/websocket';

export const dialogFormSubmit = (data: FormValues): void => {
  const message = data.message;
  if (typeof message !== 'string') throw new Error('Message must be text');
  websocketService.sendMessage(message);
};
