import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Block from '../../../../components/Block';
import Form from '../../../../components/form';
import { chatModel } from '../../../../models/chat';
import { dialogFormSubmit } from './helper';
import Message from './components/message';
import './index.scss';

const renderDialog = Handlebars.compile(template);

export default class Dialog extends Block {
  constructor() {
    super({}, renderDialog);
  }

  protected getTemplateData(): object {
    return {
      messages: chatModel.getMessages().map((message) => new Message(message).render()),
      input: new Form({
        fields: [{ type: 'text', id: 'message', name: 'message', placeholder: 'Type a message' }],
        button: { text: 'Send' },
      }).render(),
    };
  }
}

export function setupDialog(): () => void {
  const form = document.querySelector<HTMLFormElement>('.dialog__input form');
  const messages = document.querySelector<HTMLElement>('.dialog__messages');
  if (!form || !messages) throw new Error('Dialog elements not found');

  return dialogFormSubmit(form, () => {
    messages.innerHTML = chatModel.getMessages().map((message) => new Message(message).render()).join('');
    form.reset();
    form.querySelector('input')?.focus();
    messages.scrollTop = messages.scrollHeight;
  });
}
