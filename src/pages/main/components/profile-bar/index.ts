import template from './index.hbs?raw';
import Block, { type BlockOwnProps } from '../../../../components/Block';
import { registerComponent } from '../../../../components/ComponentRegistry';
import { authService } from '../../../../utils/auth';

import defaultAvatar from '../../../../assets/images/avatar.png';

import './index.scss';

interface ProfileBarProps extends BlockOwnProps {
    avatar: string;
    name: string;
}

export default class ProfileBar extends Block<ProfileBarProps> {
    static componentName = 'ProfileBar';

    protected template = template;

    constructor() {
        const user = authService.getAuthUser();
        let avatarUrl = defaultAvatar;
        if (user?.avatar) {
            avatarUrl = `https://ya-praktikum.tech/api/v2/resources${user.avatar}`;
        }
        
        super({ 
            avatar: avatarUrl, 
            name: user?.display_name || user?.first_name || 'My Profile' 
        });
    }

}

registerComponent(ProfileBar);
