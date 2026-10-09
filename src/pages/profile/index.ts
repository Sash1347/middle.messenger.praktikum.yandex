import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import Avatar from '../../assets/images/avatar.png';

import './index.scss';

const renderContent = Handlebars.compile(template);

const RenderProfileContent = () => {
    return renderContent({
        avatar: Avatar,
    });
};

export default RenderProfileContent;
