import type { FormValues } from '../../../../components/form/helper';
import { chatModel } from '../../../../models/chat';

export const dialogFormSubmit = (data: FormValues): void => {
  const message = data.message;
  if (typeof message !== 'string') throw new Error('Message must be text');
  chatModel.addMessage(message);
  console.log(data);
};
