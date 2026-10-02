import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import avatar from '../../../../assets/images/avatar.png';

import './index.scss';

const renderProfileBar = Handlebars.compile(template);

const RenderProfileBar = () => {
    return renderProfileBar({ avatar, name: 'My Profile' });
};

export default RenderProfileBar;