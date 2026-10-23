import Handlebars from 'handlebars';
import template from './index.hbs?raw';
import Block from '../../../../components/Block';

import avatar from '../../../../assets/images/avatar.png';

import './index.scss';

const renderProfileBar = Handlebars.compile(template);

export default class ProfileBar extends Block {
    constructor() {
        super({}, renderProfileBar);
    }

    protected getTemplateData(): object {
        return { avatar, name: 'My Profile' };
    }
}
