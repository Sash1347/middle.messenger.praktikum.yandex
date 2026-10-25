import template from './index.hbs?raw';
import Block, { type BlockOwnProps } from '../../../../components/Block';
import { registerComponent } from '../../../../components/ComponentRegistry';

import avatar from '../../../../assets/images/avatar.png';

import './index.scss';

interface ProfileBarProps extends BlockOwnProps {
    avatar: string;
    name: string;
}

export default class ProfileBar extends Block<ProfileBarProps> {
    static componentName = 'ProfileBar';

    protected template = template;

    constructor() {
        super({ avatar, name: 'My Profile' });
    }

}

registerComponent(ProfileBar);
