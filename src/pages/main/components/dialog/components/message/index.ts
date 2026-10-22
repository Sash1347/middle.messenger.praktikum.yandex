import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Block from '../../../../../../components/block';

import './index.scss';

export type MessageDirection = 'outgoing' | 'incoming';

const renderMessage = Handlebars.compile(template);

export interface MessageProps {
  text: string;
  direction: MessageDirection;
}

export default class MessageBlock extends Block<MessageProps> {
  constructor(props: MessageProps) {
    super(props);
  }

  protected render(): string {
    return renderMessage(this.getProps());
  }
}
