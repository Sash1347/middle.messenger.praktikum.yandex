import template from './index.hbs?raw';
import Block, { type BlockOwnProps } from '../../../../components/Block';
import { registerComponent } from '../../../../components/ComponentRegistry';

import avatar from '../../../../assets/images/avatar.png';

import './index.scss';

interface ChatCardProps extends BlockOwnProps {
    avatar: string;
    name: string;
}

export default class ChatCard extends Block<ChatCardProps> {
    static componentName = 'ChatCard';

    protected template = template;

    constructor() {
        super({ avatar, name: 'Chat name' });
    }

}

registerComponent(ChatCard);
