import template from './index.hbs?raw';
import Block from '../../../../../../components/Block';

import './index.scss';

export type MessageDirection = 'outgoing' | 'incoming';

export interface MessageProps {
  text: string;
  direction: MessageDirection;
}

export default class Message extends Block<MessageProps> {
  protected template = template;

  constructor(props: MessageProps) {
    super(props);
  }
}
