import Handlebars from 'handlebars';
import template from './index.hbs?raw';

import DefaultAvatar from '../../assets/images/avatar.png';
import { profileModel } from '../../models/profile';
import { authService } from '../../utils/auth';

import './index.scss';

const renderContent = Handlebars.compile(template);

export default function RenderProfileContent(renderToHtml: (html: string) => void) {
    const user = authService.getAuthUser();
    const profileData = user || profileModel.getProfile();
    
    let avatarUrl = DefaultAvatar;
    if (profileData?.avatar) {
        avatarUrl = `https://ya-praktikum.tech/api/v2/resources${profileData.avatar}`;
    }
    
    const dataToRender = {
        ...profileData,
        avatar: avatarUrl,
    };
    
    renderToHtml(renderContent(dataToRender));
}
