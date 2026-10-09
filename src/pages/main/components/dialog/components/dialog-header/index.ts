import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import Avatar from '../../../../../../assets/images/avatar.png';
import DeleteIcon from '../../../../../../assets/icons/delete-icon.svg';

import './index.scss';

const renderDialogHeader = Handlebars.compile(template);

const RenderDialogHeader = () => {
    return renderDialogHeader({ userAvatar: Avatar, userName: 'Chat name', deleteIcon: DeleteIcon });
};

export default RenderDialogHeader;
