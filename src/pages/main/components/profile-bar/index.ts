import template from './index.hbs?raw';
import Block from '../../../../components/Block';

import avatar from '../../../../assets/images/avatar.png';

import './index.scss';

interface ProfileBarProps {
    avatar: string;
    name: string;
}

export default class ProfileBar extends Block<ProfileBarProps> {
    protected template = template;

    constructor() {
        super({ avatar, name: 'My Profile' });
    }
}
