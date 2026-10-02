import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import avatar from '../../../../assets/images/avatar.png';

import './index.scss';

const renderChatCard = Handlebars.compile(template);

const RenderChatCard = () => {
    return renderChatCard({ avatar, name: 'Chat name' });
};

export default RenderChatCard;