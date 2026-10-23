import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Block from '../../../../../../components/Block';

import './index.scss';

export type MessageDirection = 'outgoing' | 'incoming';

const renderMessage = Handlebars.compile(template);

export interface MessageProps {
  text: string;
  direction: MessageDirection;
}

export default class Message extends Block<MessageProps> {
  constructor(props: MessageProps) {
    super(props, renderMessage);
  }
}
