import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Block from '../../../../../../components/Block';

import Avatar from '../../../../../../assets/images/avatar.png';
import DeleteIcon from '../../../../../../assets/icons/delete-icon.svg';

import './index.scss';

const renderDialogHeader = Handlebars.compile(template);

export default class DialogHeader extends Block {
    constructor() {
        super({}, renderDialogHeader);
    }

    protected getTemplateData(): object {
        return { userAvatar: Avatar, userName: 'Chat name', deleteIcon: DeleteIcon };
    }
}
