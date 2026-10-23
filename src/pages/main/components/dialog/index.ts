import template from './index.hbs?raw';
import Block from '../../../../components/Block';
import Form from '../../../../components/form';
import { chatModel } from '../../../../models/chat';
import { dialogFormSubmit } from './helper';
import Message from './components/message';
import './index.scss';

interface DialogTemplateProps {
  messages: string[];
  input: string;
}

export default class Dialog extends Block<DialogTemplateProps> {
  protected template = template;

  constructor() {
    super({
      messages: chatModel.getMessages().map((message) => new Message(message).element()?.outerHTML ?? ''),
      input: new Form({
        fields: [{ type: 'text', id: 'message', name: 'message', placeholder: 'Type a message' }],
        button: { text: 'Send' },
      }).element()?.outerHTML ?? '',
    });
  }
}

export function setupDialog(): () => void {
  const form = document.querySelector<HTMLFormElement>('.dialog__input form');
  const messages = document.querySelector<HTMLElement>('.dialog__messages');
  if (!form || !messages) throw new Error('Dialog elements not found');

  return dialogFormSubmit(form, () => {
    messages.innerHTML = chatModel
      .getMessages()
      .map((message) => new Message(message).element()?.outerHTML ?? '')
      .join('');
    form.reset();
    form.querySelector('input')?.focus();
    messages.scrollTop = messages.scrollHeight;
  });
}
