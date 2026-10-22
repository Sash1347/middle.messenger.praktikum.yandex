import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import './index.scss';

export type MessageDirection = 'outgoing' | 'incoming';

const renderMessage = Handlebars.compile(template);

export interface MessageProps {
  text: string;
  direction: MessageDirection;
}

export default function Message(props: MessageProps): string {
  return renderMessage(props);
}
