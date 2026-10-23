import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Block from '../../../../components/Block';

import avatar from '../../../../assets/images/avatar.png';

import './index.scss';

const renderChatCard = Handlebars.compile(template);

export default class ChatCard extends Block {
    constructor() {
        super({}, renderChatCard);
    }

    protected getTemplateData(): object {
        return { avatar, name: 'Chat name' };
    }
}
