import template from './index.hbs?raw';
import Block, { type BlockOwnProps } from '../../../../components/Block';
import { registerComponent } from '../../../../components/ComponentRegistry';
import type { FormProps } from '../../../../components/form';
import '../../../../components/form';
import { chatModel, type ChatMessage } from '../../../../models/chat';
import { dialogFormSubmit } from './helper';
import './components/message';
import './index.scss';

interface DialogTemplateProps extends BlockOwnProps {
  messages: ChatMessage[];
  form: FormProps;
}

export default class Dialog extends Block<DialogTemplateProps> {
  static componentName = 'Dialog';

  protected template = template;

  constructor() {
    super({
      messages: chatModel.getMessages(),
      form: {
        fields: [{ type: 'text', id: 'message', name: 'message', placeholder: 'Type a message' }],
        button: { text: 'Send' },
        onSubmit: (data) => {
          dialogFormSubmit(data);
          this.updateMessages();
        },
      },
    });
  }

  private updateMessages(): void {
    this.setProps({
      messages: chatModel.getMessages(),
    });
    const messages = this.refs.messages;
    const form = this.refs.input;
    if (!(messages instanceof HTMLElement) || !(form instanceof HTMLFormElement)) {
      throw new Error('Dialog elements not found');
    }

    form.reset();
    form.querySelector('input')?.focus();
    messages.scrollTop = messages.scrollHeight;
  }
}

registerComponent(Dialog);
