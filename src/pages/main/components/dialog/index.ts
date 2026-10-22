import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Block from '../../../../components/block';
import Form from '../../../../components/form';
import { chatModel, type ChatMessage } from '../../../../models/chat';
import { dialogFormSubmit } from './helper';
import Message from './components/message';
import './index.scss';

const renderDialog = Handlebars.compile(template);

interface DialogProps {
  messages: ChatMessage[];
}

export default class DialogBlock extends Block<DialogProps> {
  private form: Form | undefined;

  constructor() {
    super({ messages: chatModel.getMessages() });
  }

  protected render(): string {
    return renderDialog({
      messages: this.getProps().messages.map((message) => new Message(message).getContent()),
    });
  }

  protected componentDidMount(): void {
    const host = this.getHost().querySelector<HTMLElement>('.dialog__input');
    if (!host) throw new Error('Dialog form host not found');
    this.form = new Form({
      fields: [{ type: 'text', id: 'message', name: 'message', placeholder: 'Type a message' }],
      button: { text: 'Send' },
      setup: (form) => dialogFormSubmit(form, () => {
        this.setProps({ messages: chatModel.getMessages() });
        this.getHost().querySelector<HTMLInputElement>('[name="message"]')?.focus();
        const messages = this.getHost().querySelector('.dialog__messages');
        if (messages) messages.scrollTop = messages.scrollHeight;
      }),
    });
    this.form.mount(host);
  }

  protected componentWillUpdate(): void {
    this.form?.unmount();
  }

  protected componentDidUpdate(): void {
    if (this.form) this.componentDidMount();
  }

  protected componentWillUnmount(): void {
    this.form?.unmount();
    this.form = undefined;
  }
}
