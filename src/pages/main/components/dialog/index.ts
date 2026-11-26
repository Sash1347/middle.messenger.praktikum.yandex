import template from './index.hbs?raw';
import Block, { type BlockOwnProps } from '../../../../components/Block';
import { registerComponent } from '../../../../components/ComponentRegistry';
import type { FormProps } from '../../../../components/form';
import '../../../../components/form';
import { chatModel, type ChatMessage } from '../../../../models/chat';
import { dialogFormSubmit } from './helper';
import { websocketService } from '../../../../services/websocket';
import { showErrorPopup } from '../../../../utils/popup';
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
          if (typeof data.message !== 'string' || !/\S/.test(data.message)) {
            console.warn('Cannot send an empty message.');
            return;
          }
          try {
            dialogFormSubmit(data);
            const form = this.refs.input;
            if (form instanceof HTMLFormElement) form.reset();
            this.updateSendState();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            void showErrorPopup(`Could not send message: ${message}`);
          }
        },
      },
    });
  }

  protected componentDidMount(): void {
    this.element()?.addEventListener('chat:selected', this.handleChatSelected);
    this.element()?.addEventListener('chat:messages', this.handleMessages);
    this.element()?.addEventListener('chat:status', this.updateSendState);
    this.element()?.addEventListener('input', this.updateSendState);
    this.updateSendState();
  }

  protected componentWillUnmount(): void {
    this.element()?.removeEventListener('chat:selected', this.handleChatSelected);
    this.element()?.removeEventListener('chat:messages', this.handleMessages);
    this.element()?.removeEventListener('chat:status', this.updateSendState);
    this.element()?.removeEventListener('input', this.updateSendState);
  }

  private handleChatSelected = (): void => {
    this.updateMessages(true);
  };

  private handleMessages = (): void => {
    this.updateMessages(false);
  };

  private updateSendState = (): void => {
    const form = this.refs.input;
    if (!(form instanceof HTMLFormElement)) return;
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const input = form.querySelector<HTMLInputElement>('input[name="message"]');
    if (button) button.disabled = !websocketService.isConnected() || !input || !/\S/.test(input.value);
  };

  private updateMessages(reset: boolean): void {
    const oldForm = this.refs.input;
    const oldInput = oldForm?.querySelector<HTMLInputElement>('input[name="message"]');
    const value = reset ? '' : oldInput?.value ?? '';
    const focused = document.activeElement === oldInput;
    const selectionStart = oldInput?.selectionStart ?? null;
    const selectionEnd = oldInput?.selectionEnd ?? null;
    this.setProps({
      messages: chatModel.getMessages(),
    });
    const messages = this.refs.messages;
    const form = this.refs.input;
    if (!(messages instanceof HTMLElement) || !(form instanceof HTMLFormElement)) {
      throw new Error('Dialog elements not found');
    }

    const input = form.querySelector<HTMLInputElement>('input[name="message"]');
    if (input) {
      input.value = value;
      if (reset || focused) {
        input.focus();
        if (!reset && selectionStart !== null && selectionEnd !== null) {
          input.setSelectionRange(selectionStart, selectionEnd);
        }
      }
      this.updateSendState();
    }
    messages.scrollTop = messages.scrollHeight;
  }
}

registerComponent(Dialog);
