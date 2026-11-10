import template from './index.hbs?raw';
import Block, { type BlockOwnProps } from '../../../../../../components/Block';
import { registerComponent } from '../../../../../../components/ComponentRegistry';

import './index.scss';

export type MessageDirection = 'outgoing' | 'incoming';

export interface MessageProps extends BlockOwnProps {
  text: string;
  direction: MessageDirection;
}

export default class Message extends Block<MessageProps> {
  static componentName = 'Message';

  protected template = template;

  constructor(props: MessageProps) {
    super(props);
  }

}

registerComponent(Message);
