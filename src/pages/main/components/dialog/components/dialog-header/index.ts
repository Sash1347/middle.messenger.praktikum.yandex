import template from './index.hbs?raw';
import Block from '../../../../../../components/Block';

import Avatar from '../../../../../../assets/images/avatar.png';
import DeleteIcon from '../../../../../../assets/icons/delete-icon.svg';

import './index.scss';

interface DialogHeaderProps {
    userAvatar: string;
    userName: string;
    deleteIcon: string;
}

export default class DialogHeader extends Block<DialogHeaderProps> {
    protected template = template;

    constructor() {
        super({ userAvatar: Avatar, userName: 'Chat name', deleteIcon: DeleteIcon });
    }
}
