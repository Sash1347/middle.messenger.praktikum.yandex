import template from './index.hbs?raw';
import Block from '../../../../components/Block';

import avatar from '../../../../assets/images/avatar.png';

import './index.scss';

interface ChatCardProps {
    avatar: string;
    name: string;
}

export default class ChatCard extends Block<ChatCardProps> {
    protected template = template;

    constructor() {
        super({ avatar, name: 'Chat name' });
    }
}
